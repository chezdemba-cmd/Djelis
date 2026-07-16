import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PaymentStatus, SubscriptionStatus } from "@prisma/client";
import * as crypto from "crypto";

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async createTransaction(
    userId: string,
    planId: number,
    gateway: string,
    phoneMomo?: string
  ) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      throw new NotFoundException(
        "La formule d'abonnement sélectionnée n'existe pas ou est inactive."
      );
    }

    // Determine pricing and currency based on gateway
    const isLocalGateway = ["cinetpay", "wave"].includes(gateway.toLowerCase());
    const amount = isLocalGateway ? plan.priceFcfa : Number(plan.priceEuro);
    const currency = isLocalGateway ? "XOF" : "EUR";

    // 1. Create a pending payment log in the database
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        planId,
        amount,
        currency,
        gateway: gateway.toLowerCase(),
        status: PaymentStatus.PENDING,
      },
    });

    // 2. Prepare payload for Gateway API
    if (gateway.toLowerCase() === "wave") {
      // Wave Direct API integration (Simulated payload)
      // waveClient.createPayment({ amount, currency, phone: phoneMomo })
      return {
        paymentId: payment.id,
        amount,
        currency,
        gateway: "wave",
        waveLaunchUrl: `https://api.wave.com/v1/checkout/${payment.id}`, // Custom Wave Checkout Page
      };
    } else if (gateway.toLowerCase() === "cinetpay") {
      // CinetPay API integration (Simulated payload)
      return {
        paymentId: payment.id,
        amount,
        currency,
        gateway: "cinetpay",
        checkoutUrl: `https://checkout.cinetpay.com/${payment.id}`,
      };
    } else {
      // Stripe/Diaspora card payment checkout
      return {
        paymentId: payment.id,
        amount,
        currency,
        gateway: "stripe",
        stripePublishableKey: "pk_test_...",
        clientSecret: "pi_test_secret_...",
      };
    }
  }

  // Handle transaction confirmation from CinetPay / Wave Webhooks
  async handleWebhook(
    gateway: string,
    headers: Record<string, string>,
    body: any
  ) {
    let transactionId: string;
    let gatewayStatus: string;
    let errorMessage: string | undefined;
    let clientRefId: string | undefined;

    if (gateway === "wave") {
      // Vérification HMAC Wave
      const waveSignature = headers["wave-signature"];
      if (!waveSignature)
        throw new UnauthorizedException("Signature Wave manquante");

      const waveSecret = process.env.WAVE_WEBHOOK_SECRET || "test_secret";
      const payloadString = JSON.stringify(body);
      const expectedSignature = crypto
        .createHmac("sha256", waveSecret)
        .update(payloadString)
        .digest("hex");

      if (
        waveSignature !== expectedSignature &&
        process.env.NODE_ENV === "production"
      ) {
        throw new UnauthorizedException(
          "Signature Wave invalide (Tentative de fraude détectée)"
        );
      }

      transactionId = body.id; // Wave session ID
      clientRefId = body.client_reference_id || (body.metadata?.payment_id as string) || (body.metadata?.client_reference_id as string);
      gatewayStatus = body.status; // succeeded, failed
    } else if (gateway === "cinetpay") {
      // Vérification HMAC CinetPay
      const cinetpaySignature = headers["x-token"];
      if (!cinetpaySignature)
        throw new UnauthorizedException("Signature CinetPay manquante");

      const cinetpaySecret = process.env.CINETPAY_SECRET || "test_secret";
      const payloadString = JSON.stringify(body);
      const expectedSignature = crypto
        .createHmac("sha256", cinetpaySecret)
        .update(payloadString)
        .digest("hex");

      if (
        cinetpaySignature !== expectedSignature &&
        process.env.NODE_ENV === "production"
      ) {
        throw new UnauthorizedException(
          "Signature CinetPay invalide (Tentative de fraude détectée)"
        );
      }

      transactionId = body.cpm_trans_id;
      gatewayStatus = body.status === "ACCEPTED" ? "succeeded" : "failed";
      errorMessage = body.cpm_error_message;
    } else {
      throw new BadRequestException(
        "Passerelle de paiement non prise en charge."
      );
    }

    // Find the pending payment - check if clientRefId or transactionId is a valid UUID
    const lookupId = clientRefId || transactionId;
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        lookupId
      );
    const payment = await this.prisma.payment.findFirst({
      where: isUuid
        ? { id: lookupId, status: PaymentStatus.PENDING }
        : {
            gatewayTransactionId: lookupId,
            status: PaymentStatus.PENDING,
          },
    });

    if (!payment) {
      throw new NotFoundException("Transaction introuvable ou déjà traitée.");
    }

    if (gatewayStatus === "succeeded") {
      // 1. Update payment to successful
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCESSFUL,
          gatewayTransactionId: transactionId,
        },
      });

      if (!payment.userId || !payment.planId) {
        throw new BadRequestException(
          "Données de transaction incomplètes (userId ou planId manquant)."
        );
      }

      // 2. Fetch plan details to calculate dates
      const plan = await this.prisma.plan.findUnique({
        where: { id: payment.planId },
      });
      const durationDays = plan ? plan.durationDays : 30;

      // Find the associated subscription or create a new one
      const subscription = await this.prisma.subscription.create({
        data: {
          userId: payment.userId,
          planId: payment.planId,
          startsAt: new Date(),
          // Calculate endsAt based on duration days. For local Momo we default autoRenew to false.
          endsAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
          status: SubscriptionStatus.ACTIVE,
          paymentMethod: gateway,
        },
      });

      // Update payment record to attach subscription ID
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { subscriptionId: subscription.id },
      });

      return { status: "success", subscriptionId: subscription.id };
    } else {
      // Update payment status to failed
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          errorMessage:
            errorMessage ||
            "Paiement décliné par la banque ou solde mobile money insuffisant.",
        },
      });
      return { status: "failed" };
    }
  }

  async getPaymentStatus(id: string) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      );
    const payment = await this.prisma.payment.findFirst({
      where: isUuid ? { id } : { gatewayTransactionId: id },
    });
    if (!payment) {
      throw new NotFoundException("Transaction introuvable.");
    }
    return payment;
  }

  async getPlans(country?: string) {
    const plans = await this.prisma.plan.findMany({
      where: { isActive: true },
    });
    return plans.map((p) => ({
      id: p.id.toString(),
      name: p.name,
      slug: p.name.toLowerCase().replace(" ", "-"),
      duration_type:
        p.durationDays === 1
          ? "day"
          : p.durationDays === 3
          ? "weekend"
          : "month",
      duration_value: p.durationDays === 1 ? 1 : p.durationDays === 3 ? 3 : 1,
      price_xof: p.priceFcfa,
      price_eur: p.priceEuro ? Number(p.priceEuro) : null,
      countries: ["ML", "SN", "CI", "FR"],
      is_active: p.isActive,
      badge:
        p.name === "Pass Mois"
          ? "Meilleur Prix"
          : p.name === "Pass Week-end"
          ? "Populaire"
          : null,
    }));
  }
}
