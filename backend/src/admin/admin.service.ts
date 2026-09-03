import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
  UnsupportedMediaTypeException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import * as crypto from "crypto";
import { SignUploadDto } from "./dto/sign-upload.dto";
import { CreateContentDto } from "./dto/create-content.dto";

const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "media";

const ALLOWED_MEDIA_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
];
const ALLOWED_COVER_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const EXT_BY_MIME: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/wav": "wav",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

@Injectable()
export class AdminService {
  // Une lecture n'est comptée comme "vue" qu'au-delà de ce seuil de visionnage
  // réel (issu de WatchHistory.progressSeconds), pas au simple clic sur Play.
  private readonly VIEW_THRESHOLD_SECONDS = 30;

  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const usersCount = await this.prisma.user.count();
    const activeSubsCount = await this.prisma.subscription.count({
      where: { status: "ACTIVE" },
    });
    const videosCount = await this.prisma.content.count({
      where: { type: "VIDEO" },
    });
    const audiosCount = await this.prisma.content.count({
      where: { type: "AUDIO" },
    });
    const totalQualifiedViews = await this.prisma.watchHistory.count({
      where: { progressSeconds: { gte: this.VIEW_THRESHOLD_SECONDS } },
    });

    return {
      users: usersCount,
      activeSubs: activeSubsCount,
      videos: videosCount,
      audios: audiosCount,
      totalViews: totalQualifiedViews,
    };
  }

  async getContentStats(contentId: string) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
    });
    if (!content) {
      throw new NotFoundException("Contenu non trouvé");
    }

    const qualifying = await this.prisma.watchHistory.findMany({
      where: {
        contentId,
        progressSeconds: { gte: this.VIEW_THRESHOLD_SECONDS },
      },
      select: { profileId: true, progressSeconds: true },
    });

    const uniqueViewers = new Set(qualifying.map((w) => w.profileId)).size;
    const totalViews = qualifying.length;
    const avgWatchDurationSec =
      totalViews > 0
        ? Math.round(
            qualifying.reduce((sum, w) => sum + w.progressSeconds, 0) /
              totalViews
          )
        : 0;

    return {
      contentId,
      totalViews,
      uniqueViewers,
      avgWatchDurationSec,
    };
  }

  async getAllContents() {
    return this.prisma.content.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
      },
    });
  }

  async toggleContentStatus(id: string) {
    const content = await this.prisma.content.findUnique({ where: { id } });
    if (!content) {
      throw new NotFoundException("Contenu non trouvé");
    }
    return this.prisma.content.update({
      where: { id },
      data: { isActive: !content.isActive },
    });
  }

  async deleteContent(id: string) {
    const content = await this.prisma.content.findUnique({ where: { id } });
    if (!content) {
      throw new NotFoundException("Contenu non trouvé");
    }
    return this.prisma.content.delete({
      where: { id },
    });
  }

  // ─── Upload direct navigateur -> Supabase Storage ──────────────────────────
  // Le binaire (MP4/MP3) ne passe jamais par l'API : on renvoie une URL signée
  // à usage unique et le client fait le PUT directement vers Supabase.

  private supabaseConfig() {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      throw new ServiceUnavailableException(
        "Stockage Supabase non configuré (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)."
      );
    }
    return { baseUrl: url.replace(/\/+$/, ""), serviceKey };
  }

  private supabaseHeaders(serviceKey: string) {
    return {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    };
  }

  private publicUrlFor(objectPath: string) {
    const { baseUrl } = this.supabaseConfig();
    return `${baseUrl}/storage/v1/object/public/${SUPABASE_BUCKET}/${objectPath}`;
  }

  async createSignedUpload(dto: SignUploadDto) {
    const { baseUrl, serviceKey } = this.supabaseConfig();

    const allowed =
      dto.kind === "cover"
        ? ALLOWED_COVER_MIME_TYPES
        : ALLOWED_MEDIA_MIME_TYPES;
    if (!allowed.includes(dto.contentType)) {
      throw new UnsupportedMediaTypeException(
        `Type de fichier non autorisé pour "${dto.kind}": ${dto.contentType}`
      );
    }

    const folder = dto.kind === "cover" ? "covers" : "media";
    const rawExt =
      EXT_BY_MIME[dto.contentType] ||
      (dto.fileName.split(".").pop() || "").toLowerCase();
    const ext = rawExt.replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
    // Chemin généré côté serveur : le client ne choisit pas où il écrit.
    const objectPath = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const res = await fetch(
      `${baseUrl}/storage/v1/object/upload/sign/${SUPABASE_BUCKET}/${objectPath}`,
      {
        method: "POST",
        headers: {
          ...this.supabaseHeaders(serviceKey),
          "Content-Type": "application/json",
        },
        body: "{}",
      }
    );

    if (!res.ok) {
      throw new ServiceUnavailableException(
        `Impossible de générer l'URL d'upload Supabase (${res.status}).`
      );
    }

    const data = (await res.json().catch(() => ({}))) as { url?: string };
    // Supabase renvoie un chemin relatif à /storage/v1, ex:
    //   /object/upload/sign/media/media/169...-uuid.mp4?token=<jwt>
    if (!data?.url || !/[?&]token=/.test(data.url)) {
      throw new ServiceUnavailableException(
        "Réponse de signature Supabase invalide."
      );
    }
    const tokenMatch = data.url.match(/[?&]token=([^&]+)/);

    return {
      path: objectPath,
      // URL absolue à laquelle le navigateur envoie le fichier (PUT direct).
      signedUrl: `${baseUrl}/storage/v1${data.url}`,
      token: tokenMatch ? decodeURIComponent(tokenMatch[1]) : null,
      publicUrl: this.publicUrlFor(objectPath),
    };
  }

  private async assertObjectExists(objectPath: string) {
    const { baseUrl, serviceKey } = this.supabaseConfig();
    const res = await fetch(
      `${baseUrl}/storage/v1/object/info/${SUPABASE_BUCKET}/${objectPath}`,
      { headers: this.supabaseHeaders(serviceKey) }
    );
    if (!res.ok) {
      throw new BadRequestException(
        `Fichier introuvable dans le stockage : ${objectPath}. L'upload est-il terminé ?`
      );
    }
  }

  /**
   * Extrait l'ID (11 caractères) d'une URL YouTube (watch, youtu.be, embed,
   * shorts, live). Lève une 400 si l'URL n'est pas exploitable.
   */
  private parseYoutubeId(url: string): string {
    const patterns = [
      /[?&]v=([A-Za-z0-9_-]{11})/,
      /youtu\.be\/([A-Za-z0-9_-]{11})/,
      /youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{11})/,
      /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
      /youtube\.com\/live\/([A-Za-z0-9_-]{11})/,
    ];
    for (const re of patterns) {
      const m = url.match(re);
      if (m) return m[1];
    }
    throw new BadRequestException(
      "Impossible d'extraire l'ID de la vidéo YouTube."
    );
  }

  async createContent(dto: CreateContentDto) {
    const youtubeId = dto.youtubeUrl
      ? this.parseYoutubeId(dto.youtubeUrl)
      : null;
    if (!youtubeId && !dto.mediaPath) {
      throw new BadRequestException(
        "Fournir un fichier média ou un lien YouTube."
      );
    }

    // Le média Supabase doit réellement exister avant d'enregistrer la fiche.
    if (dto.mediaPath && !youtubeId) {
      await this.assertObjectExists(dto.mediaPath);
    }
    if (dto.coverPath) {
      await this.assertObjectExists(dto.coverPath);
    }

    let genre = await this.prisma.genre.findFirst({
      where: { slug: dto.category },
    });
    if (!genre) {
      genre = await this.prisma.genre.findFirst();
    }
    let category = null;
    if (genre) {
      category = await this.prisma.category.findUnique({
        where: { id: genre.categoryId },
      });
    }
    if (!category) {
      category = await this.prisma.category.findFirst();
    }

    const contentType = dto.type === "Audio / Podcast" ? "AUDIO" : "VIDEO";
    const slug =
      dto.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

    const mediaUrl =
      dto.mediaPath && !youtubeId ? this.publicUrlFor(dto.mediaPath) : null;
    const coverUrl = dto.coverPath
      ? this.publicUrlFor(dto.coverPath)
      : youtubeId
      ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
      : "/assets/empire_mali.png";

    const content = await this.prisma.content.create({
      data: {
        title: dto.title,
        slug: slug,
        type: contentType,
        format: "SINGLE",
        synopsis: dto.synopsis || "",
        thumbnailUrl: coverUrl,
        trailerCfId: mediaUrl, // média stocké (Supabase) ; null pour YouTube
        youtubeId: youtubeId,
        // Un contenu YouTube est du gratuit/promo : jamais derrière le péage.
        isPremium: youtubeId ? false : undefined,
        categoryId: category?.id || 1,
        genreId: genre?.id || 1,
        publishedAt: dto.publishedAtStart
          ? new Date(dto.publishedAtStart)
          : new Date(),
        isActive: true,
      },
    });

    // Épisode unique uniquement pour un média stocké. Un contenu YouTube est
    // lu directement via content.youtubeId (pas de /stream/token).
    if (mediaUrl) {
      await this.prisma.episode.create({
        data: {
          contentId: content.id,
          title: dto.title,
          episodeNumber: 1,
          seasonNumber: 1,
          duration: 0,
          cfStreamId: mediaUrl,
        },
      });
    }

    return content;
  }
}
