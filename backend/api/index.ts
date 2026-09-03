import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedServer: express.Express;

async function bootstrapServer(): Promise<express.Express> {
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    app.use(helmet());
    app.setGlobalPrefix("api/v1");
    
    app.enableCors({
      origin: process.env.NODE_ENV === "production"
        ? ["https://djelis.com", "https://web.djelis.com"]
        : "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );

    await app.init();
    cachedServer = expressApp;
  }
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const server = await bootstrapServer();
  return server(req, res);
}
