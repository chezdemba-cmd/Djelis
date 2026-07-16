import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import * as crypto from "crypto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

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
    @Body("progress_sec") progressSec: number,
    @Body("profile_id") profileId?: string
  ) {
    let profile;
    if (profileId) {
      profile = await this.prisma.profile.findFirst({
        where: { id: profileId, userId: req.user.id },
      });
    }
    if (!profile) {
      profile = await this.prisma.profile.findFirst({
        where: { userId: req.user.id },
      });
    }

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
  @Get("history")
  @HttpCode(HttpStatus.OK)
  async getHistory(
    @Req() req: any,
    @Query("profile_id") profileId: string,
    @Query("type") type?: string
  ) {
    if (!profileId) {
      return { success: false, message: "profile_id requis" };
    }

    const profile = await this.prisma.profile.findFirst({
      where: { id: profileId, userId: req.user.id },
    });

    if (!profile) {
      return { success: false, message: "Profil invalide" };
    }

    const whereClause: any = {
      profileId: profile.id,
      isFinished: false,
      progressSeconds: { gt: 0 },
    };

    if (type) {
      whereClause.content = { type };
    }

    const history = await this.prisma.watchHistory.findMany({
      where: whereClause,
      include: {
        content: true,
        episode: true,
      },
      orderBy: {
        lastWatchedAt: "desc",
      },
      take: 10,
    });

    return history;
  }

  @UseGuards(JwtAuthGuard)
  @Post("token")
  @HttpCode(HttpStatus.OK)
  async getStreamToken(
    @Req() req: any,
    @Body("content_id") contentId: string,
    @Body("episode_id") episodeId?: string
  ) {
    // Vérification des droits d'accès
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE', endsAt: { gt: new Date() } }
        },
        rentals: {
          where: { contentId: contentId, expiresAt: { gt: new Date() } }
        }
      }
    });

    if (!user) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }

    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      include: { episodes: { orderBy: { episodeNumber: "asc" } } },
    });

    if (content?.isPremium) {
       const hasActiveSubscription = user.subscriptions && user.subscriptions.length > 0;
       const hasActiveRental = user.rentals && user.rentals.length > 0;
       
       if (!hasActiveSubscription && !hasActiveRental) {
          throw new HttpException('Accès refusé. Abonnement ou location requise.', HttpStatus.FORBIDDEN);
       }
    }

    let cfStreamId = episodeId || contentId;

    if (episodeId) {
      const episode = await this.prisma.episode.findUnique({
        where: { id: episodeId },
      });
      if (episode) {
        cfStreamId = episode.cfStreamId;
      }
    } else {
      if (content) {
        if (content.episodes && content.episodes.length > 0) {
          cfStreamId = content.episodes[0].cfStreamId;
        } else if (content.trailerCfId) {
          cfStreamId = content.trailerCfId;
        }
      }
    }

    const keyId = process.env.CLOUDFLARE_KEY_ID;
    const privateKeyB64 = process.env.CLOUDFLARE_PRIVATE_KEY;

    let signedUrl = `https://videodelivery.net/${cfStreamId}/manifest/video.m3u8`;

    if (keyId && privateKeyB64) {
      try {
        const token = this.signCloudflareToken(cfStreamId, keyId, privateKeyB64);
        signedUrl = `${signedUrl}?token=${token}`;
      } catch (error) {
        console.error("Erreur de signature Cloudflare Stream:", error);
      }
    }

    return {
      signed_url: signedUrl,
    };
  }

  private signCloudflareToken(
    videoId: string,
    keyId: string,
    privateKeyB64: string
  ): string {
    const header = {
      alg: "RS256",
      kid: keyId,
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      sub: videoId,
      kid: keyId,
      exp: now + 3600, // 1 hour expiration
      nbf: now - 300,  // 5 minutes buffer
    };

    const base64UrlEncode = (str: string) => {
      return Buffer.from(str)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
    };

    const headerB64 = base64UrlEncode(JSON.stringify(header));
    const payloadB64 = base64UrlEncode(JSON.stringify(payload));
    const signInput = `${headerB64}.${payloadB64}`;

    const privateKey = Buffer.from(privateKeyB64, "base64").toString("utf8");

    const sign = crypto.createSign("RSA-SHA256");
    sign.update(signInput);
    const signature = sign
      .sign(privateKey, "base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    return `${signInput}.${signature}`;
  }
}
