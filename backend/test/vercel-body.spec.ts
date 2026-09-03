import { vercelBodyParser } from "../src/vercel-body";

describe("vercelBodyParser", () => {
  const response = {} as any;

  it("ne relit pas le flux quand Vercel a déjà parsé le JSON", () => {
    const body = { email: "user@example.com", password: "secret123" };
    const request = {
      body,
      header: (name: string) =>
        name.toLowerCase() === "content-type" ? "application/json" : undefined,
    } as any;
    const next = jest.fn();

    vercelBodyParser(request, response, next);

    expect(next).toHaveBeenCalledWith();
    expect(request.body).toEqual(body);
    expect(request.rawBody.toString("utf8")).toBe(JSON.stringify(body));
  });

  it("préserve le corps exact transmis par le proxy webhook", () => {
    const rawBody = '{ "payment_id": "42", "status": "paid" }';
    const request = {
      body: JSON.parse(rawBody),
      header: (name: string) => {
        if (name.toLowerCase() === "content-type") return "application/json";
        if (name.toLowerCase() === "x-djelis-raw-body") {
          return Buffer.from(rawBody, "utf8").toString("base64");
        }
        return undefined;
      },
    } as any;
    const next = jest.fn();

    vercelBodyParser(request, response, next);

    expect(next).toHaveBeenCalledWith();
    expect(request.rawBody.toString("utf8")).toBe(rawBody);
  });

  it("refuse un corps signé différent du JSON traité", () => {
    const signedBody = JSON.stringify({ payment_id: "42", status: "paid" });
    const request = {
      body: { payment_id: "42", status: "failed" },
      header: (name: string) => {
        if (name.toLowerCase() === "content-type") return "application/json";
        if (name.toLowerCase() === "x-djelis-raw-body") {
          return Buffer.from(signedBody, "utf8").toString("base64");
        }
        return undefined;
      },
    } as any;
    const next = jest.fn();

    vercelBodyParser(request, response, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
