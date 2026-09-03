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
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "media";
// Durée de validité de l'URL signée renvoyée au lecteur (assez pour un long-métrage).
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 4;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_PROGRESS_SECONDS = 86_400; // 24 h

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
    if (!contentId || !UUID_RE.test(contentId)) {
      return { success: false, message: "content_id invalide." };
    }
    if (episodeId && !UUID_RE.test(episodeId)) {
      return { success: false, message: "episode_id invalide." };
    }
    // Valeur cliente bornée : entier, entre 0 et 24 h.
    const rawSec = Number(progressSec);
    const safeSec = Number.isFinite(rawSec)
      ? Math.min(Math.max(Math.floor(rawSec), 0), MAX_PROGRESS_SECONDS)
      : 0;

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
          progressSeconds: safeSec,
          lastWatchedAt: new Date(),
        },
      });
    } else {
      await this.prisma.watchHistory.create({
        data: {
          profileId: profile.id,
          contentId,
          episodeId: episodeId || null,
          progressSeconds: safeSec,
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
          where: { status: "ACTIVE", endsAt: { gt: new Date() } },
        },
        rentals: {
          where: { contentId: contentId, expiresAt: { gt: new Date() } },
        },
      },
    });

    if (!user) {
      throw new HttpException("Utilisateur non trouvé", HttpStatus.NOT_FOUND);
    }

    const content = await this.prisma.content.findFirst({
      where: { id: contentId, isActive: true },
      include: { episodes: { orderBy: { episodeNumber: "asc" } } },
    });

    if (!content) {
      throw new HttpException("Contenu introuvable", HttpStatus.NOT_FOUND);
    }

    // Contenu YouTube (gratuit/promo) : pas de jeton, le client lit l'embed
    // directement via content.youtube_id.
    if (content.youtubeId) {
      throw new HttpException(
        "Contenu YouTube : lecture directe via l'embed, aucun jeton requis.",
        HttpStatus.BAD_REQUEST
      );
    }

    // Restriction géographique : le pays est déduit de l'IP par la plateforme
    // (Vercel / Cloudflare), jamais fourni par le client. Un contenu SANS
    // territoire défini reste disponible partout ; s'il en a, il faut une
    // ligne "autorisé" pour le pays détecté.
    const country = String(
      req.headers["x-vercel-ip-country"] || req.headers["cf-ipcountry"] || ""
    ).toUpperCase();
    if (country && country !== "XX" && country !== "T1") {
      const territoryCount = await this.prisma.rightsTerritory.count({
        where: { contentId },
      });
      if (territoryCount > 0) {
        const allowed = await this.prisma.rightsTerritory.findFirst({
          where: { contentId, countryCode: country, isAllowed: true },
        });
        if (!allowed) {
          throw new HttpException(
            "Ce contenu n'est pas disponible dans votre pays.",
            HttpStatus.FORBIDDEN
          );
        }
      }
    }

    if (content?.isPremium) {
      const hasActiveSubscription = user.subscriptions.length > 0;
      const hasActiveRental = user.rentals && user.rentals.length > 0;

      if (!hasActiveSubscription && !hasActiveRental) {
        throw new HttpException(
          "Accès refusé. Abonnement ou location requise.",
          HttpStatus.FORBIDDEN
        );
      }
    }

    let mediaRef: string | null = null;

    if (episodeId) {
      const episode = await this.prisma.episode.findFirst({
        where: { id: episodeId, contentId },
      });
      if (!episode) {
        throw new HttpException(
          "Episode introuvable pour ce contenu",
          HttpStatus.NOT_FOUND
        );
      }
      mediaRef = episode.cfStreamId;
    } else if (content) {
      if (content.episodes && content.episodes.length > 0) {
        mediaRef = content.episodes[0].cfStreamId;
      } else if (content.trailerCfId) {
        mediaRef = content.trailerCfId;
      }
    }

    if (!mediaRef) {
      throw new HttpException(
        "Aucun média disponible pour ce contenu",
        HttpStatus.NOT_FOUND
      );
    }

    return { signed_url: await this.signPlaybackUrl(mediaRef) };
  }

  /**
   * Transforme la référence média stockée en URL de lecture à courte durée.
   * - URL Supabase (publique ou signée) -> on ré-signe le chemin de l'objet.
   * - Chemin d'objet nu ("media/xxx.mp4") -> on signe directement.
   * - URL externe (échantillons de démo, autre CDN) -> renvoyée telle quelle.
   */
  private async signPlaybackUrl(ref: string): Promise<string> {
    const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let objectPath: string | null = null;

    if (/^https?:\/\//i.test(ref)) {
      if (supabaseUrl && ref.startsWith(supabaseUrl)) {
        const m = ref.match(
          /\/object\/(?:public\/|sign\/|authenticated\/)?[^/]+\/(.+?)(?:\?|$)/
        );
        objectPath = m ? decodeURIComponent(m[1]) : null;
      } else {
        // Média hébergé ailleurs (échantillons) : rien à signer.
        return ref;
      }
    } else {
      objectPath = ref.replace(/^\/+/, "");
    }

    if (!objectPath) {
      throw new HttpException(
        "Référence média illisible",
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }

    if (!supabaseUrl || !serviceKey) {
      throw new HttpException(
        "Service de streaming temporairement indisponible",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    let res: Awaited<ReturnType<typeof fetch>>;
    try {
      res = await fetch(
        `${supabaseUrl}/storage/v1/object/sign/${SUPABASE_BUCKET}/${objectPath}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            apikey: serviceKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ expiresIn: SIGNED_URL_TTL_SECONDS }),
        }
      );
    } catch {
      throw new HttpException(
        "Service de streaming temporairement indisponible",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    if (!res.ok) {
      throw new HttpException(
        "Service de streaming temporairement indisponible",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    const data = (await res.json().catch(() => ({}))) as { signedURL?: string };
    if (!data?.signedURL) {
      throw new HttpException(
        "Service de streaming temporairement indisponible",
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    // signedURL est relatif : /object/sign/media/<path>?token=<jwt>
    return `${supabaseUrl}/storage/v1${data.signedURL}`;
  }
}
