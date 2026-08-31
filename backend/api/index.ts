import express from "express";
import { createServerlessApp } from "../src/bootstrap";

// Capture le corps brut de la requête AVANT tout parsing, pour permettre la
// vérification de signature HMAC des webhooks de paiement (Wave / CinetPay).
// Sur Vercel, Nest ne parse pas le corps lui-même (bodyParser: false) : ce
// middleware s'en charge et conserve les octets originaux dans req.rawBody.
const captureRawBody = (req: any, _res: express.Response, buf: Buffer) => {
  if (buf && buf.length) {
    req.rawBody = Buffer.from(buf);
  }
};

let cachedServer: express.Express;

async function bootstrapServer(): Promise<express.Express> {
  if (!cachedServer) {
    const expressApp = express();
    expressApp.use(
      express.json({ verify: captureRawBody, limit: "2mb" })
    );
    expressApp.use(
      express.urlencoded({
        extended: true,
        verify: captureRawBody,
        limit: "2mb",
      })
    );
    await createServerlessApp(expressApp);
    cachedServer = expressApp;
  }
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const server = await bootstrapServer();
  return server(req, res);
}
