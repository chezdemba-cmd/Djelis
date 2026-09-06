import express = require("express");

const RAW_BODY_HEADER = "x-djelis-raw-body";

const captureRawBody = (req: any, _res: express.Response, buf: Buffer) => {
  if (buf.length > 0) {
    req.rawBody = Buffer.from(buf);
  }
};

const jsonParser = express.json({ verify: captureRawBody, limit: "2mb" });
const urlencodedParser = express.urlencoded({
  extended: true,
  verify: captureRawBody,
  limit: "2mb",
});

function bodyFromForwardingHeader(req: express.Request): Buffer | undefined {
  const encoded = req.header(RAW_BODY_HEADER);
  if (!encoded) return undefined;

  const rawBody = Buffer.from(encoded, "base64");
  if (rawBody.toString("base64") !== encoded) {
    throw new Error("En-tête de corps brut invalide");
  }

  const contentType = req.header("content-type") || "";
  if (contentType.includes("application/json")) {
    const forwardedBody = JSON.parse(rawBody.toString("utf8"));
    if (JSON.stringify(forwardedBody) !== JSON.stringify(req.body)) {
      throw new Error(
        "Le corps signé ne correspond pas au corps de la requête"
      );
    }
  }

  return rawBody;
}

/**
 * Vercel fournit généralement `req.body` déjà parsé. Dans ce cas il ne faut
 * surtout pas essayer de relire le flux HTTP, qui est déjà consommé. Hors
 * Vercel (tests et exécution locale), les parseurs Express restent utilisés.
 */
export function vercelBodyParser(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  if (req.body !== undefined) {
    try {
      const forwardedRawBody = bodyFromForwardingHeader(req);
      (req as any).rawBody =
        forwardedRawBody ||
        (Buffer.isBuffer(req.body)
          ? Buffer.from(req.body)
          : Buffer.from(
              typeof req.body === "string"
                ? req.body
                : JSON.stringify(req.body),
              "utf8"
            ));
      next();
    } catch (error) {
      next(error);
    }
    return;
  }

  const contentType = req.header("content-type") || "";
  const parser = contentType.includes("application/x-www-form-urlencoded")
    ? urlencodedParser
    : jsonParser;
  parser(req, res, next);
}
