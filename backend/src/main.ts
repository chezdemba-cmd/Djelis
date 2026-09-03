import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";

async function bootstrap() {
  // Sécurité par environnement : vérifier la présence des secrets JWT
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    console.error(
      "ERREUR CRITIQUE : Les variables d'environnement JWT_SECRET et JWT_REFRESH_SECRET doivent être définies."
    );
    process.exit(1);
  }

  // Preserve the exact request bytes so payment webhook signatures can be
  // verified against what the gateway actually sent.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Sécurisation des headers HTTP avec Helmet
  app.use(helmet());

  // Set global route prefix
  app.setGlobalPrefix("api/v1");

  // Enable CORS for web apps and diaspora access (Restricted for Production)
  app.enableCors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://djelis.com", "https://web.djelis.com"]
        : "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // Enable request payload validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Djeli'S API is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
