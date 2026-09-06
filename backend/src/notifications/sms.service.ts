import { Injectable, Logger } from "@nestjs/common";
import type { DeliveryResult } from "./email.service";

/**
 * Envoi de SMS via Twilio (API REST, pas de SDK).
 *
 * Si `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM` ne sont pas
 * configurés, le SMS est seulement journalisé (dev), sans casser la prod.
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  isConfigured(): boolean {
    return Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_FROM
    );
  }

  async send(to: string, body: string): Promise<DeliveryResult> {
    if (!this.isConfigured()) {
      this.logger.warn(
        `SMS non envoyé (config Twilio absente). Destinataire=${to}`
      );
      return { delivered: false, fallback: true };
    }

    const sid = process.env.TWILIO_ACCOUNT_SID as string;
    const auth = Buffer.from(
      `${sid}:${process.env.TWILIO_AUTH_TOKEN}`
    ).toString("base64");

    try {
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: to,
            From: process.env.TWILIO_FROM as string,
            Body: body,
          }).toString(),
        }
      );

      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        this.logger.error(`Twilio a répondu ${res.status}: ${errBody}`);
        return { delivered: false, error: `twilio_${res.status}` };
      }
      return { delivered: true };
    } catch (err: any) {
      this.logger.error(`Échec d'envoi Twilio: ${err?.message || err}`);
      return { delivered: false, error: "network" };
    }
  }

  /** SMS contenant un code de vérification à usage unique. */
  async sendOtp(phone: string, code: string): Promise<DeliveryResult> {
    return this.send(
      phone,
      `Djeli'S : votre code de vérification est ${code}. Il expire dans 5 minutes.`
    );
  }
}
