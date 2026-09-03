import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ServiceUnavailableException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Liveness probe : le process répond. Ne touche à aucune dépendance.
   * À utiliser pour le redémarrage automatique (Render / Docker / K8s).
   */
  @Get("live")
  @HttpCode(HttpStatus.OK)
  live() {
    return { status: "ok", uptime: process.uptime() };
  }

  /**
   * Readiness probe : le service peut réellement traiter une requête
   * (connexion base de données vérifiée). Renvoie 503 si la base est
   * injoignable, ce qui évite qu'un routeur envoie du trafic à une
   * instance non fonctionnelle.
   */
  @Get()
  async check() {
    const startedAt = Date.now();
    let database: "up" | "down" = "down";
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = "up";
    } catch {
      database = "down";
    }

    const body = {
      status: database === "up" ? "ok" : "degraded",
      database,
      latencyMs: Date.now() - startedAt,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };

    if (database !== "up") {
      throw new ServiceUnavailableException(body);
    }
    return body;
  }
}
