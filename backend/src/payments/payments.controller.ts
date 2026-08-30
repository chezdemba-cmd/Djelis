import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  ParseIntPipe,
  Headers,
  UnauthorizedException,
} from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller(["payment", "payments"])
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post("pay")
  @HttpCode(HttpStatus.OK)
  async pay(
    @Req() req: any,
    @Body("plan_id", ParseIntPipe) planId: number,
    @Body("gateway") gateway: string,
    @Body("phone_momo") phoneMomo?: string
  ) {
    const userId = req.user.id;
    return this.paymentsService.createTransaction(
      userId,
      planId,
      gateway,
      phoneMomo
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post("initiate")
  @HttpCode(HttpStatus.OK)
  async initiatePayment(
    @Req() req: any,
    @Body("plan_id") planIdStr: string,
    @Body("provider") provider: string,
    @Body("phone") phone?: string
  ) {
    const userId = req.user.id;
    const planId = parseInt(planIdStr, 10);
    const result = await this.paymentsService.createTransaction(
      userId,
      planId,
      provider,
      phone
    );
    return {
      payment_id: result.paymentId,
      status: "pending",
      redirect_url: result.checkoutUrl || result.waveLaunchUrl || null,
      ussd_code: null,
      expires_at: null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("status/:id")
  @HttpCode(HttpStatus.OK)
  async getStatus(@Req() req: any, @Param("id") id: string) {
    const payment = await this.paymentsService.getPaymentStatus(
      id,
      req.user.id
    );
    return {
      status: payment.status.toLowerCase(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post("promo/validate")
  @HttpCode(HttpStatus.OK)
  async validatePromo(
    @Body("code") code: string,
    @Body("plan_id") _planId: string
  ) {
    return {
      valid:
        code.toUpperCase() === "DJELIPROMO" || code.toUpperCase() === "WELCOME",
    };
  }

  // Gateway IP validation should be added in a production interceptor/guard
  @Post("webhooks/:gateway")
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param("gateway") gateway: string,
    @Headers() headers: Record<string, string>,
    @Body() body: any,
    @Req() req: any
  ) {
    this.verifyWebhookIp(gateway, req);
    const rawBody = req.rawBody?.toString("utf8");
    if (!rawBody) {
      throw new UnauthorizedException("Corps brut du webhook indisponible");
    }
    return this.paymentsService.handleWebhook(
      gateway.toLowerCase(),
      headers,
      body,
      rawBody
    );
  }

  private verifyWebhookIp(gateway: string, req: any) {
    if (process.env.NODE_ENV !== "production") return;

    // Get client IP
    const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const ip = typeof rawIp === "string" ? rawIp.split(",")[0].trim() : "";

    // Load allowed IPs from environment variables
    const allowedIpsEnv = process.env[`ALLOWED_IPS_${gateway.toUpperCase()}`];
    if (!allowedIpsEnv) {
      throw new UnauthorizedException(
        `Liste d'IP autorisees manquante pour ${gateway}`
      );
    }

    const allowedIps = allowedIpsEnv.split(",").map((item) => item.trim());
    if (!allowedIps.includes(ip)) {
      throw new UnauthorizedException(
        `IP ${ip} non autorisée pour les webhooks ${gateway}`
      );
    }
  }
}
