import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import type express from "express";
import helmet from "helmet";
import { AppModule } from "./app.module";

/**
 * Configuration partagée entre l'exécution standard (main.ts) et l'exécution
 * serverless (api/index.ts) pour éviter toute divergence entre les deux.
 */

export function assertRequiredEnv(): void {
  const missing = ["JWT_SECRET", "JWT_REFRESH_SECRET"].filter(
    (key) => !process.env[key]
  );
  if (missing.length > 0) {
    throw new Error(
      `ERREUR CRITIQUE : variables d'environnement manquantes : ${missing.join(
        ", "
      )}`
    );
  }
}

function corsConfig() {
  const prodOrigins = [
    "https://djelis.com",
    "https://web.djelis.com",
    ...(process.env.EXTRA_CORS_ORIGINS
      ? process.env.EXTRA_CORS_ORIGINS.split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : []),
  ];

  return {
    // `true` reflète l'origine de la requête (compatible avec credentials,
    // contrairement à "*").
    origin: process.env.NODE_ENV === "production" ? prodOrigins : true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  };
}

function configure(app: INestApplication): void {
  app.use(helmet());
  app.setGlobalPrefix("api/v1");
  app.enableCors(corsConfig());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );
}

/** Application standard (exécution locale / serveur long-running). */
export async function createApp(): Promise<INestApplication> {
  assertRequiredEnv();
  // rawBody: true -> Nest expose req.rawBody pour la vérification de signature
  // des webhooks de paiement.
  const app = await NestFactory.create(AppModule, { rawBody: true });
  configure(app);
  return app;
}

/**
 * Application serverless (Vercel). Ici le corps brut est capturé par un
 * middleware Express en amont (voir api/index.ts) : Nest ne parse pas le corps
 * lui-même pour ne pas consommer le flux avant cette capture.
 */
export async function createServerlessApp(
  expressApp: express.Express
): Promise<INestApplication> {
  assertRequiredEnv();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { bodyParser: false }
  );
  configure(app);
  await app.init();
  return app;
}
