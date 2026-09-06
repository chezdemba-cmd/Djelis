import * as crypto from "crypto";
import {
  verifyWaveSignature,
  verifyCinetpaySignature,
  buildCinetpaySignedPayload,
  CINETPAY_HMAC_FIELDS,
} from "./webhook-signature";

describe("verifyWaveSignature", () => {
  const secret = "wave_test_secret";
  const rawBody = JSON.stringify({ id: "sess_1", status: "succeeded" });
  const sign = (ts: number, body: string) =>
    crypto.createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex");

  it("accepte une signature valide et récente", () => {
    const ts = Math.floor(Date.now() / 1000);
    const header = `t=${ts}, v1=${sign(ts, rawBody)}`;
    expect(verifyWaveSignature(rawBody, header, secret)).toEqual({ valid: true });
  });

  it("accepte si l'une des signatures v1 correspond", () => {
    const ts = Math.floor(Date.now() / 1000);
    const header = `t=${ts}, v1=${"0".repeat(64)}, v1=${sign(ts, rawBody)}`;
    expect(verifyWaveSignature(rawBody, header, secret).valid).toBe(true);
  });

  it("rejette un corps altéré", () => {
    const ts = Math.floor(Date.now() / 1000);
    const header = `t=${ts}, v1=${sign(ts, rawBody)}`;
    const res = verifyWaveSignature(rawBody + " ", header, secret);
    expect(res.valid).toBe(false);
  });

  it("rejette un timestamp périmé (anti-rejeu)", () => {
    const ts = Math.floor(Date.now() / 1000) - 3600;
    const header = `t=${ts}, v1=${sign(ts, rawBody)}`;
    const res = verifyWaveSignature(rawBody, header, secret);
    expect(res.valid).toBe(false);
    expect(res.reason).toMatch(/rejeu|tolérance/);
  });

  it("rejette un en-tête absent ou malformé", () => {
    expect(verifyWaveSignature(rawBody, undefined, secret).valid).toBe(false);
    expect(verifyWaveSignature(rawBody, "garbage", secret).valid).toBe(false);
    expect(verifyWaveSignature(rawBody, "v1=abc", secret).valid).toBe(false);
  });

  it("rejette si le secret est vide", () => {
    const ts = Math.floor(Date.now() / 1000);
    const header = `t=${ts}, v1=${sign(ts, rawBody)}`;
    expect(verifyWaveSignature(rawBody, header, "").valid).toBe(false);
  });
});

describe("verifyCinetpaySignature", () => {
  const secret = "cinetpay_test_secret";
  const fields: Record<string, string> = {
    cpm_site_id: "12345",
    cpm_trans_id: "abc-123",
    cpm_trans_date: "2026-09-06 12:00:00",
    cpm_amount: "1500",
    cpm_currency: "XOF",
    signature: "md5sig",
    payment_method: "OM",
    cel_phone_num: "77000000",
    cpm_phone_prefixe: "221",
    cpm_language: "fr",
    cpm_version: "V4",
    cpm_payment_config: "SINGLE",
    cpm_page_action: "PAYMENT",
    cpm_custom: "",
    cpm_designation: "Abonnement",
    cpm_error_message: "",
  };
  const token = () =>
    crypto
      .createHmac("sha256", secret)
      .update(buildCinetpaySignedPayload(fields))
      .digest("hex");

  it("concatène les champs dans l'ordre documenté", () => {
    const expected = CINETPAY_HMAC_FIELDS.map((f) => fields[f] ?? "").join("");
    expect(buildCinetpaySignedPayload(fields)).toBe(expected);
  });

  it("accepte un x-token valide", () => {
    expect(verifyCinetpaySignature(fields, token(), secret)).toEqual({
      valid: true,
    });
  });

  it("rejette si un champ signé est modifié", () => {
    const tampered = { ...fields, cpm_amount: "1" };
    expect(verifyCinetpaySignature(tampered, token(), secret).valid).toBe(false);
  });

  it("rejette un token absent ou non hexadécimal", () => {
    expect(verifyCinetpaySignature(fields, undefined, secret).valid).toBe(false);
    expect(verifyCinetpaySignature(fields, "xyz", secret).valid).toBe(false);
  });

  it("traite les champs manquants comme des chaînes vides", () => {
    const partial = { cpm_site_id: "12345", cpm_trans_id: "abc-123" };
    const t = crypto
      .createHmac("sha256", secret)
      .update(buildCinetpaySignedPayload(partial))
      .digest("hex");
    expect(verifyCinetpaySignature(partial, t, secret).valid).toBe(true);
  });
});
