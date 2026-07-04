import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma.service";

@Controller("stream")
export class StreamController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Post("progress")
  @HttpCode(HttpStatus.OK)
  async reportProgress(
    @Req() req: any,
    @Body("content_id") contentId: string,
    @Body("episode_id") episodeId: string | null,
    @Body("progress_sec") progressSec: number
  ) {
    const profile = await this.prisma.profile.findFirst({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return {
        success: false,
        message: "Aucun profil trouvé pour cet utilisateur.",
      };
    }

    const existing = await this.prisma.watchHistory.findFirst({
      where: {
        profileId: profile.id,
        contentId,
        episodeId: episodeId || null,
      },
    });

    if (existing) {
      await this.prisma.watchHistory.update({
        where: { id: existing.id },
        data: {
          progressSeconds: progressSec,
          lastWatchedAt: new Date(),
        },
      });
    } else {
      await this.prisma.watchHistory.create({
        data: {
          profileId: profile.id,
          contentId,
          episodeId: episodeId || null,
          progressSeconds: progressSec,
        },
      });
    }

    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post("token")
  @HttpCode(HttpStatus.OK)
  async getStreamToken(
    @Req() req: any,
    @Body("content_id") contentId: string,
    @Body("episode_id") episodeId?: string
  ) {
    const streamId = episodeId || contentId;
    return {
      signed_url: `https://videodelivery.net/${streamId}/manifest/video.m3u8`,
    };
  }
}
