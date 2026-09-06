import { Injectable, Logger } from "@nestjs/common";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface DeliveryResult {
  delivered: boolean;
  fallback?: boolean;
  error?: string;
}

/**
 * Envoi d'e-mails transactionnels via Resend (API REST, pas de SDK).
 *
 * Si `RESEND_API_KEY` / `EMAIL_FROM` ne sont pas configurés, l'e-mail est
 * seulement journalisé : le flux (mot de passe oublié, vérification…) reste
 * fonctionnel en dev sans casser en prod.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  isConfigured(): boolean {
    return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
  }

  async send(message: EmailMessage): Promise<DeliveryResult> {
    if (!this.isConfigured()) {
      this.logger.warn(
        `E-mail non envoyé (RESEND_API_KEY/EMAIL_FROM absents). ` +
          `Destinataire=${message.to} Sujet="${message.subject}"`
      );
      return { delivered: false, fallback: true };
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM,
          to: [message.to],
          subject: message.subject,
          html: message.html,
          text: message.text,
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        this.logger.error(`Resend a répondu ${res.status}: ${body}`);
        return { delivered: false, error: `resend_${res.status}` };
      }
      return { delivered: true };
    } catch (err: any) {
      this.logger.error(`Échec d'envoi Resend: ${err?.message || err}`);
      return { delivered: false, error: "network" };
    }
  }

  /** E-mail de réinitialisation de mot de passe. */
  async sendPasswordReset(to: string, resetUrl: string): Promise<DeliveryResult> {
    return this.send({
      to,
      subject: "Réinitialisation de votre mot de passe Djeli'S",
      text:
        `Vous avez demandé à réinitialiser votre mot de passe.\n\n` +
        `Ouvrez ce lien (valable 1 heure) : ${resetUrl}\n\n` +
        `Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`,
      html:
        `<p>Vous avez demandé à réinitialiser votre mot de passe.</p>` +
        `<p><a href="${resetUrl}">Choisir un nouveau mot de passe</a> (lien valable 1 heure).</p>` +
        `<p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>`,
    });
  }
}
