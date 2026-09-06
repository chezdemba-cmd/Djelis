import * as crypto from "crypto";

/**
 * Vérification des signatures de webhooks des passerelles de paiement.
 *
 * ⚠️ Les schémas ci-dessous suivent la documentation publique de chaque
 * passerelle. Ils restent à confronter à un vrai webhook de sandbox avant la
 * mise en production (aucune clé réelle n'est encore configurée).
 */

/** Comparaison à temps constant de deux chaînes hexadécimales. */
export function timingSafeEqualHex(a: string, b: string): boolean {
  if (
    typeof a !== "string" ||
    typeof b !== "string" ||
    !/^[0-9a-f]+$/i.test(a) ||
    !/^[0-9a-f]+$/i.test(b) ||
    a.length !== b.length
  ) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

/**
 * Wave (Wave Business API) — en-tête `Wave-Signature`.
 *
 * Format façon Stripe : `t=<timestamp unix>, v1=<hmac hex>[, v1=<hmac hex>...]`.
 * Charge signée = `${timestamp}.${corps brut}`, HMAC-SHA256 avec le secret du
 * webhook (`WAVE_WEBHOOK_SECRET`), sortie hex.
 *
 * @param toleranceSec fenêtre anti-rejeu (par défaut 300 s).
 */
export function verifyWaveSignature(
  rawBody: string,
  signatureHeader: string | undefined,
  secret: string,
  toleranceSec = 300
): { valid: boolean; reason?: string } {
  if (!signatureHeader) return { valid: false, reason: "en-tête absent" };
  if (!secret) return { valid: false, reason: "secret non configuré" };

  const parts = signatureHeader.split(",").map((p) => p.trim());
  let timestamp: string | undefined;
  const providedSignatures: string[] = [];
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key === "t") timestamp = value;
    else if (key === "v1") providedSignatures.push(value);
  }

  if (!timestamp || !/^\d+$/.test(timestamp)) {
    return { valid: false, reason: "timestamp absent ou invalide" };
  }
  if (providedSignatures.length === 0) {
    return { valid: false, reason: "aucune signature v1" };
  }

  const ageSec = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (ageSec > toleranceSec) {
    return { valid: false, reason: "timestamp hors tolérance (rejeu)" };
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const match = providedSignatures.some((sig) =>
    timingSafeEqualHex(sig, expected)
  );
  return match
    ? { valid: true }
    : { valid: false, reason: "signature invalide" };
}

/**
 * Ordre exact des champs concaténés pour le HMAC CinetPay (`x-token`).
 * Source : documentation CinetPay « Notification / HMAC ».
 */
export const CINETPAY_HMAC_FIELDS = [
  "cpm_site_id",
  "cpm_trans_id",
  "cpm_trans_date",
  "cpm_amount",
  "cpm_currency",
  "signature",
  "payment_method",
  "cel_phone_num",
  "cpm_phone_prefixe",
  "cpm_language",
  "cpm_version",
  "cpm_payment_config",
  "cpm_page_action",
  "cpm_custom",
  "cpm_designation",
  "cpm_error_message",
] as const;

/** Reconstruit la chaîne signée CinetPay à partir des champs POST reçus. */
export function buildCinetpaySignedPayload(
  fields: Record<string, unknown>
): string {
  return CINETPAY_HMAC_FIELDS.map((name) => {
    const v = fields?.[name];
    return v === undefined || v === null ? "" : String(v);
  }).join("");
}

/**
 * CinetPay — en-tête `x-token`.
 *
 * HMAC-SHA256 de la concaténation (sans séparateur) des champs
 * {@link CINETPAY_HMAC_FIELDS} du corps POST (`application/x-www-form-urlencoded`),
 * clé = clé secrète CinetPay (`CINETPAY_SECRET`), sortie hex.
 */
export function verifyCinetpaySignature(
  fields: Record<string, unknown>,
  token: string | undefined,
  secret: string
): { valid: boolean; reason?: string } {
  if (!token) return { valid: false, reason: "en-tête x-token absent" };
  if (!secret) return { valid: false, reason: "secret non configuré" };

  const payload = buildCinetpaySignedPayload(fields);
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return timingSafeEqualHex(token, expected)
    ? { valid: true }
    : { valid: false, reason: "signature invalide" };
}
