import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Suppression définitive du compte (exigence Google Play).
   *
   * Données SUPPRIMÉES (cascade Prisma) : profils, historique de lecture,
   * favoris, locations, appareils, sessions.
   * Données ANONYMISÉES et conservées : paiements (`Payment.userId` -> null,
   * obligation légale/comptable). Les abonnements sont supprimés explicitement
   * (relation `Restrict`).
   */
  async deleteAccount(userId: string): Promise<{ success: true }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("Compte introuvable.");
    }

    await this.prisma.$transaction(async (tx) => {
      // Abonnements : relation onDelete=Restrict -> à retirer avant le user.
      await tx.subscription.deleteMany({ where: { userId } });
      // Le reste part en cascade ; les paiements sont anonymisés (SetNull).
      await tx.user.delete({ where: { id: userId } });
    });

    this.logger.log(`Compte supprimé: ${userId}`);
    return { success: true };
  }
}
