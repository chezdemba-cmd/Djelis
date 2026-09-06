import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { stripMediaRefs } from "../catalog/media-sanitizer";

@Controller("favorites")
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private prisma: PrismaService) {}

  // profile_id est obligatoire : pas de repli sur un profil arbitraire, sinon
  // les favoris d'un profil fuiteraient vers les autres profils du compte.
  private async resolveProfile(userId: string, profileId?: string) {
    if (!profileId) return null;
    return this.prisma.profile.findFirst({
      where: { id: profileId, userId },
    });
  }

  @Get()
  async list(@Req() req: any, @Query("profile_id") profileId?: string) {
    const profile = await this.resolveProfile(req.user.id, profileId);
    if (!profile) return [];

    const favorites = await this.prisma.favorite.findMany({
      where: { profileId: profile.id },
      include: { content: true },
      orderBy: { createdAt: "desc" },
    });
    return favorites.map((f) => stripMediaRefs(f.content));
  }

  @Post(":contentId")
  @HttpCode(HttpStatus.CREATED)
  async add(
    @Req() req: any,
    @Param("contentId") contentId: string,
    @Body("profile_id") profileId?: string
  ) {
    const profile = await this.resolveProfile(req.user.id, profileId);
    if (!profile) {
      return {
        success: false,
        message: "profile_id requis ou invalide.",
      };
    }

    await this.prisma.favorite.upsert({
      where: { profileId_contentId: { profileId: profile.id, contentId } },
      update: {},
      create: { profileId: profile.id, contentId },
    });
    return { success: true };
  }

  @Delete(":contentId")
  @HttpCode(HttpStatus.OK)
  async remove(
    @Req() req: any,
    @Param("contentId") contentId: string,
    @Query("profile_id") profileId?: string
  ) {
    const profile = await this.resolveProfile(req.user.id, profileId);
    if (!profile) {
      return {
        success: false,
        message: "profile_id requis ou invalide.",
      };
    }

    await this.prisma.favorite.deleteMany({
      where: { profileId: profile.id, contentId },
    });
    return { success: true };
  }
}
