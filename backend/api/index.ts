import express from "express";
import { createServerlessApp } from "../src/bootstrap";
import { vercelBodyParser } from "../src/vercel-body";

let cachedServer: express.Express;

async function bootstrapServer(): Promise<express.Express> {
  if (!cachedServer) {
    const expressApp = express();
    expressApp.use(vercelBodyParser);
    await createServerlessApp(expressApp);
    cachedServer = expressApp;
  }
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const server = await bootstrapServer();
  return server(req, res);
}
