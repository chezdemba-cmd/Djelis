import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PaymentStatus, SubscriptionStatus } from "@prisma/client";
import {
  verifyWaveSignature,
  verifyCinetpaySignature,
} from "./webhook-signature";

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async createTransaction(
    userId: string,
    planId: number,
    gateway: string,
    _phoneMomo?: string
  ) {
    const normalizedGateway = gateway?.toLowerCase();
    if (!["wave", "cinetpay"].includes(normalizedGateway)) {
      throw new BadRequestException(
        "Passerelle de paiement non prise en charge."
      );
    }

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      throw new NotFoundException(
        "La formule d'abonnement sélectionnée n'existe pas ou est inactive."
      );
    }

    // Wave & CinetPay encaissent en XOF.
    const isLocalGateway = ["cinetpay", "wave"].includes(normalizedGateway);
    const amount = isLocalGateway ? plan.priceFcfa : Number(plan.priceEuro);
    const currency = isLocalGateway ? "XOF" : "EUR";

    const payment = await this.prisma.payment.create({
      data: {
        userId,
        planId,
        amount,
        currency,
        gateway: normalizedGateway,
        status: PaymentStatus.PENDING,
      },
    });

    return this.initiateGatewayCheckout({
      payment,
      amount,
      currency,
      gateway: normalizedGateway,
      description: `Abonnement ${plan.name} - Djeli'S`,
    });
  }

  /**
   * Location à l'acte (TVOD). Crée une location "inactive" (expiresAt = epoch)
   * puis un paiement en attente ; la location est activée au webhook de succès
   * (cf. handleWebhook), pour une durée RENTAL_DURATION_HOURS (défaut 48 h).
   */
  async createRental(userId: string, contentId: string, gateway: string) {
    const normalizedGateway = gateway?.toLowerCase();
    if (!["wave", "cinetpay"].includes(normalizedGateway)) {
      throw new BadRequestException(
        "Passerelle de paiement non prise en charge."
      );
    }

    const content = await this.prisma.content.findFirst({
      where: { id: contentId, isActive: true },
    });
    if (!content) {
      throw new NotFoundException("Contenu introuvable.");
    }
    if (!content.isPremium) {
      throw new BadRequestException(
        "Ce contenu est gratuit : aucune location nécessaire."
      );
    }
    if (content.rentalPriceFcfa == null) {
      throw new BadRequestException(
        "Ce contenu n'est pas proposé à la location."
      );
    }

    // Déjà accessible ? (abonnement actif ou location en cours)
    const now = new Date();
    const [activeSub, activeRental] = await Promise.all([
      this.prisma.subscription.findFirst({
        where: {
          userId,
          status: SubscriptionStatus.ACTIVE,
          endsAt: { gt: now },
        },
      }),
      this.prisma.rental.findFirst({
        where: { userId, contentId, expiresAt: { gt: now } },
      }),
    ]);
    if (activeSub) {
      throw new BadRequestException("Vous avez déjà un abonnement actif.");
    }
    if (activeRental) {
      throw new BadRequestException(
        "Vous avez déjà une location en cours pour ce contenu."
      );
    }

    const isLocalGateway = ["cinetpay", "wave"].includes(normalizedGateway);
    const amount = isLocalGateway
      ? content.rentalPriceFcfa
      : Number(content.rentalPriceEuro ?? 0);
    const currency = isLocalGateway ? "XOF" : "EUR";

    const rental = await this.prisma.rental.create({
      data: { userId, contentId, expiresAt: new Date(0) },
    });
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        rentalId: rental.id,
        amount,
        currency,
        gateway: normalizedGateway,
        status: PaymentStatus.PENDING,
      },
    });

    return this.initiateGatewayCheckout({
      payment,
      amount,
      currency,
      gateway: normalizedGateway,
      description: `Location "${content.title}" - Djeli'S`,
    });
  }

  /** Ouvre une session de paiement chez la passerelle pour un paiement déjà créé. */
  private async initiateGatewayCheckout(params: {
    payment: { id: string };
    amount: number;
    currency: string;
    gateway: string;
    description: string;
  }) {
    const { payment, amount, currency, gateway, description } = params;
    const isSimulation = process.env.ENABLE_PAYMENT_SIMULATION === "true";
    const appUrl =
      process.env.APP_URL || process.env.WEB_APP_URL || "https://djelis.com";
    const apiPublicUrl =
      process.env.PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://api.djelis.com";

    if (gateway === "wave") {
      if (isSimulation) {
        return {
          paymentId: payment.id,
          amount,
          currency,
          gateway: "wave",
          waveLaunchUrl: `https://api.wave.com/v1/checkout/${payment.id}`,
        };
      }

      const waveApiKey = process.env.WAVE_API_KEY;
      if (!waveApiKey) {
        throw new ServiceUnavailableException(
          "WAVE_API_KEY non configurée : impossible d'initier un paiement réel Wave."
        );
      }

      try {
        const res = await fetch("https://api.wave.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${waveApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amount.toString(),
            currency: currency,
            error_url: `${appUrl}/profile?payment=error&payment_id=${payment.id}`,
            success_url: `${appUrl}/profile?payment=success&payment_id=${payment.id}`,
            client_reference_id: payment.id,
          }),
        });

        if (!res.ok) {
          const errData = await res.text().catch(() => "");
          console.error("Wave session creation failed:", res.status, errData);
          throw new ServiceUnavailableException(
            "Échec de l'initialisation du paiement avec Wave."
          );
        }

        const waveData = await res.json();
        return {
          paymentId: payment.id,
          amount,
          currency,
          gateway: "wave",
          waveLaunchUrl: waveData.wave_launch_url || waveData.checkout_url,
        };
      } catch (err: any) {
        if (err instanceof ServiceUnavailableException) throw err;
        console.error("Wave API error:", err);
        throw new ServiceUnavailableException(
          "Erreur lors de la communication avec Wave."
        );
      }
    } else if (gateway === "cinetpay") {
      if (isSimulation) {
        return {
          paymentId: payment.id,
          amount,
          currency,
          gateway: "cinetpay",
          checkoutUrl: `https://checkout.cinetpay.com/${payment.id}`,
        };
      }

      const cinetpayApiKey = process.env.CINETPAY_API_KEY;
      const cinetpaySiteId = process.env.CINETPAY_SITE_ID;
      if (!cinetpayApiKey || !cinetpaySiteId) {
        throw new ServiceUnavailableException(
          "CINETPAY_API_KEY ou CINETPAY_SITE_ID non configurés : impossible d'initier un paiement réel CinetPay."
        );
      }

      try {
        const res = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apikey: cinetpayApiKey,
            site_id: cinetpaySiteId,
            transaction_id: payment.id,
            amount: amount,
            currency: currency,
            description,
            return_url: `${appUrl}/profile?payment=success&payment_id=${payment.id}`,
            notify_url: `${apiPublicUrl}/api/v1/payments/webhooks/cinetpay`,
            channels: "ALL",
          }),
        });

        if (!res.ok) {
          const errData = await res.text().catch(() => "");
          console.error(
            "CinetPay payment initiation failed:",
            res.status,
            errData
          );
          throw new ServiceUnavailableException(
            "Échec de l'initialisation du paiement avec CinetPay."
          );
        }

        const cinetData = await res.json();
        const paymentUrl = cinetData?.data?.payment_url;
        if (!paymentUrl) {
          throw new ServiceUnavailableException(
            cinetData?.description || "Lien de paiement CinetPay indisponible."
          );
        }

        return {
          paymentId: payment.id,
          amount,
          currency,
          gateway: "cinetpay",
          checkoutUrl: paymentUrl,
        };
      } catch (err: any) {
        if (err instanceof ServiceUnavailableException) throw err;
        console.error("CinetPay API error:", err);
        throw new ServiceUnavailableException(
          "Erreur lors de la communication avec CinetPay."
        );
      }
    }

    throw new BadRequestException("Passerelle de paiement non prise en charge.");
  }

  // Handle transaction confirmation from CinetPay / Wave Webhooks
  async handleWebhook(
    gateway: string,
    headers: Record<string, string>,
    body: any,
    rawBody: string
  ) {
    let transactionId: string;
    let gatewayStatus: string;
    let errorMessage: string | undefined;
    let clientRefId: string | undefined;

    if (gateway === "wave") {
      const waveSecret = process.env.WAVE_WEBHOOK_SECRET;
      if (!waveSecret) {
        throw new UnauthorizedException(
          "WAVE_WEBHOOK_SECRET non configuré : impossible de vérifier ce webhook."
        );
      }
      const check = verifyWaveSignature(
        rawBody,
        headers["wave-signature"],
        waveSecret
      );
      if (!check.valid) {
        throw new UnauthorizedException(
          `Signature Wave invalide (${check.reason}).`
        );
      }

      transactionId = body.id; // Wave session ID
      clientRefId =
        body.client_reference_id ||
        (body.metadata?.payment_id as string) ||
        (body.metadata?.client_reference_id as string);
      gatewayStatus = body.status; // succeeded, failed
    } else if (gateway === "cinetpay") {
      const cinetpaySecret = process.env.CINETPAY_SECRET;
      if (!cinetpaySecret) {
        throw new UnauthorizedException(
          "CINETPAY_SECRET non configuré : impossible de vérifier ce webhook."
        );
      }
      // CinetPay signe la concaténation de champs POST précis (cf.
      // webhook-signature.ts), pas le corps brut.
      const check = verifyCinetpaySignature(
        body,
        headers["x-token"],
        cinetpaySecret
      );
      if (!check.valid) {
        throw new UnauthorizedException(
          `Signature CinetPay invalide (${check.reason}).`
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

    // 🔒 SECURITE CRITIQUE : Vérification du montant payé par rapport au prix exigé
    let webhookAmount = 0;
    if (gateway === "wave" && body.amount) {
      webhookAmount = Number(body.amount);
    } else if (gateway === "cinetpay" && body.cpm_amount) {
      webhookAmount = Number(body.cpm_amount);
    }

    // Si la passerelle nous fournit un montant, on vérifie qu'il est suffisant
    if (
      !Number.isFinite(webhookAmount) ||
      webhookAmount !== Number(payment.amount)
    ) {
      gatewayStatus = "failed";
      errorMessage = `ALERTE FRAUDE : Montant insuffisant (${webhookAmount} au lieu de ${payment.amount})`;
      console.warn(
        `[SECURITY] Tentative de contournement de prix bloquée sur la transaction: ${payment.id}`
      );
    }

    if (gatewayStatus === "succeeded") {
      if (!payment.userId) {
        throw new BadRequestException(
          "Données de transaction incomplètes (userId manquant)."
        );
      }

      // Location à l'acte : on active la location (expiresAt réel).
      if (payment.rentalId) {
        const hours = Number(process.env.RENTAL_DURATION_HOURS) || 48;
        const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
        await this.prisma.$transaction(async (tx) => {
          await tx.rental.update({
            where: { id: payment.rentalId as string },
            data: { expiresAt },
          });
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.SUCCESSFUL,
              gatewayTransactionId: transactionId,
            },
          });
        });
        return { status: "success", rentalId: payment.rentalId, expiresAt };
      }

      if (!payment.planId) {
        throw new BadRequestException(
          "Données de transaction incomplètes (planId manquant)."
        );
      }
      const paymentUserId = payment.userId;
      const paymentPlanId = payment.planId;

      // 2. Fetch plan details to calculate dates
      const plan = await this.prisma.plan.findUnique({
        where: { id: payment.planId },
      });
      const durationDays = plan ? plan.durationDays : 30;

      const subscription = await this.prisma.$transaction(async (tx) => {
        const created = await tx.subscription.create({
          data: {
            userId: paymentUserId,
            planId: paymentPlanId,
            startsAt: new Date(),
            endsAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
            status: SubscriptionStatus.ACTIVE,
            paymentMethod: gateway,
          },
        });
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.SUCCESSFUL,
            gatewayTransactionId: transactionId,
            subscriptionId: created.id,
          },
        });
        return created;
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

  async getPaymentStatus(id: string, userId: string) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      );
    const payment = await this.prisma.payment.findFirst({
      where: isUuid ? { id, userId } : { gatewayTransactionId: id, userId },
    });
    if (!payment) {
      throw new NotFoundException("Transaction introuvable.");
    }
    return payment;
  }

  async getPlans(_country?: string) {
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
