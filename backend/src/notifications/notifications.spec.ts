import { EmailService } from "./email.service";
import { SmsService } from "./sms.service";

describe("EmailService", () => {
  const OLD_ENV = process.env;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    fetchMock = jest.fn();
    (global as any).fetch = fetchMock;
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("journalise sans appeler Resend quand non configuré", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
    const svc = new EmailService();
    const res = await svc.sendPasswordReset(
      "u@x.com",
      "https://x/reset?token=t"
    );
    expect(res).toEqual({ delivered: false, fallback: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("appelle l'API Resend avec le bon payload quand configuré", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "Djeli'S <no-reply@djelis.com>";
    fetchMock.mockResolvedValue({ ok: true });
    const svc = new EmailService();

    const res = await svc.sendPasswordReset(
      "u@x.com",
      "https://x/reset?token=t"
    );

    expect(res).toEqual({ delivered: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(opts.headers.Authorization).toBe("Bearer re_test");
    const body = JSON.parse(opts.body);
    expect(body.from).toBe("Djeli'S <no-reply@djelis.com>");
    expect(body.to).toEqual(["u@x.com"]);
    expect(body.html).toContain("https://x/reset?token=t");
  });

  it("renvoie une erreur si Resend répond non-2xx", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "a@b.c";
    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      text: async () => "invalid",
    });
    const svc = new EmailService();
    const res = await svc.send({ to: "u@x.com", subject: "s", html: "<p/>" });
    expect(res.delivered).toBe(false);
    expect(res.error).toBe("resend_422");
  });
});

describe("SmsService", () => {
  const OLD_ENV = process.env;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    fetchMock = jest.fn();
    (global as any).fetch = fetchMock;
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("journalise sans appeler Twilio quand non configuré", async () => {
    delete process.env.TWILIO_ACCOUNT_SID;
    const svc = new SmsService();
    const res = await svc.sendOtp("+221770000000", "123456");
    expect(res).toEqual({ delivered: false, fallback: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("poste sur l'endpoint Messages avec auth Basic et corps form", async () => {
    process.env.TWILIO_ACCOUNT_SID = "AC123";
    process.env.TWILIO_AUTH_TOKEN = "tok";
    process.env.TWILIO_FROM = "+15550000000";
    fetchMock.mockResolvedValue({ ok: true });
    const svc = new SmsService();

    const res = await svc.sendOtp("+221770000000", "123456");

    expect(res).toEqual({ delivered: true });
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://api.twilio.com/2010-04-01/Accounts/AC123/Messages.json"
    );
    expect(opts.headers.Authorization).toBe(
      `Basic ${Buffer.from("AC123:tok").toString("base64")}`
    );
    const params = new URLSearchParams(opts.body);
    expect(params.get("To")).toBe("+221770000000");
    expect(params.get("From")).toBe("+15550000000");
    expect(params.get("Body")).toContain("123456");
  });
});
