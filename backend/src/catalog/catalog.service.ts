import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { ContentType } from "@prisma/client";

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  mapContentToMobile(content: any) {
    if (!content) return null;
    return {
      id: content.id,
      title: content.title,
      synopsis: content.synopsis || "",
      poster_url: content.thumbnailUrl || "",
      trailer_url: content.trailerCfId
        ? `https://videodelivery.net/${content.trailerCfId}/manifest/video.m3u8`
        : null,
      type: content.type.toLowerCase(),
      category_id: content.categoryId?.toString(),
      category: content.category ? { name: content.category.name } : null,
      release_year: content.publishedAt
        ? new Date(content.publishedAt).getFullYear()
        : 2026,
      age_rating: content.ageRating || "G",
      is_featured: content.isPremium || false,
      is_original: true,
      episodes: content.episodes
        ? content.episodes.map((e) => ({
            id: e.id,
            season: e.seasonNumber,
            episode_number: e.episodeNumber,
            title: e.title,
            synopsis: e.synopsis || "",
            duration_min: Math.ceil(e.duration / 60),
            thumbnail_url: content.thumbnailUrl || "",
          }))
        : [],
    };
  }

  // Separates landing page components into DjaaSoo (Video) and DjeliSon (Audio)
  async getHomeFeed(country?: string) {
    const djaasooVideos = await this.prisma.content.findMany({
      where: {
        type: ContentType.VIDEO,
        isActive: true,
        rightsTerritories: country
          ? {
              some: {
                countryCode: country,
                isAllowed: true,
              },
            }
          : undefined,
      },
      take: 10,
      orderBy: { publishedAt: "desc" },
      include: { creator: true, category: true, genre: true },
    });

    const djelisonAudios = await this.prisma.content.findMany({
      where: {
        type: ContentType.AUDIO,
        isActive: true,
        rightsTerritories: country
          ? {
              some: {
                countryCode: country,
                isAllowed: true,
              },
            }
          : undefined,
      },
      take: 10,
      orderBy: { publishedAt: "desc" },
      include: { creator: true, category: true, genre: true },
    });

    return {
      djaasoo: {
        title: "DjaaSoo - Vidéos & Cinéma",
        contents: djaasooVideos,
      },
      djelison: {
        title: "DjeliSon - Musique & Podcasts",
        contents: djelisonAudios,
      },
    };
  }

  async getFeatured(country?: string) {
    const territoryFilter = country
      ? {
          some: {
            countryCode: country.toUpperCase(),
            isAllowed: true,
          },
        }
      : undefined;

    const heroVideo = await this.prisma.content.findFirst({
      where: {
        type: ContentType.VIDEO,
        isActive: true,
        rightsTerritories: territoryFilter,
      },
      include: { creator: true, category: true, episodes: true },
    });

    const djaasooVideos = await this.prisma.content.findMany({
      where: {
        type: ContentType.VIDEO,
        isActive: true,
        rightsTerritories: territoryFilter,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { creator: true, category: true, episodes: true },
    });

    const djelisonAudios = await this.prisma.content.findMany({
      where: {
        type: ContentType.AUDIO,
        isActive: true,
        rightsTerritories: territoryFilter,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { creator: true, category: true, episodes: true },
    });

    return {
      hero: heroVideo ? this.mapContentToMobile(heroVideo) : null,
      rows: [
        {
          title: "Cinéma & Long-métrages",
          contents: djaasooVideos.map((v) => this.mapContentToMobile(v)),
        },
        {
          title: "Podcasts & Contes",
          contents: djelisonAudios.map((a) => this.mapContentToMobile(a)),
        },
      ],
    };
  }

  async getContents(
    type?: string,
    categoryId?: string,
    countryCode?: string,
    page = 1,
    limit = 20
  ) {
    const skip = (page - 1) * limit;

    let contentTypes: ContentType[] = [];
    if (type) {
      if (
        type.toLowerCase() === "video" ||
        type.toLowerCase() === "film" ||
        type.toLowerCase() === "series"
      ) {
        contentTypes = [ContentType.VIDEO];
      } else if (
        type.toLowerCase() === "audio" ||
        type.toLowerCase() === "podcast" ||
        type.toLowerCase() === "music"
      ) {
        contentTypes = [ContentType.AUDIO];
      }
    }

    const whereClause: any = {
      isActive: true,
      ...(contentTypes.length > 0 ? { type: { in: contentTypes } } : {}),
      ...(categoryId ? { categoryId: parseInt(categoryId, 10) } : {}),
      ...(countryCode
        ? {
            rightsTerritories: {
              some: { countryCode: countryCode.toUpperCase(), isAllowed: true },
            },
          }
        : {}),
    };

    const [contents, total] = await Promise.all([
      this.prisma.content.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { creator: true, category: true, episodes: true },
      }),
      this.prisma.content.count({ where: whereClause }),
    ]);

    return {
      data: contents.map((c) => this.mapContentToMobile(c)),
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async getContentById(id: string) {
    const content = await this.prisma.content.findUnique({
      where: { id },
      include: {
        creator: true,
        category: true,
        episodes: {
          orderBy: { episodeNumber: "asc" },
        },
      },
    });

    if (!content || !content.isActive) {
      throw new NotFoundException("Contenu introuvable ou indisponible.");
    }

    return content;
  }

  async getContentDetail(id: string) {
    let content;
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      );

    if (isUuid) {
      content = await this.prisma.content.findUnique({
        where: { id },
        include: { creator: true, category: true, episodes: true },
      });
    } else {
      content = await this.prisma.content.findFirst({
        where: { slug: id },
        include: { creator: true, category: true, episodes: true },
      });
    }

    if (!content || !content.isActive) {
      throw new NotFoundException("Contenu introuvable ou indisponible.");
    }

    return this.mapContentToMobile(content);
  }

  async getPopular(country?: string) {
    const contents = await this.prisma.content.findMany({
      where: {
        isActive: true,
        rightsTerritories: country
          ? {
              some: {
                countryCode: country.toUpperCase(),
                isAllowed: true,
              },
            }
          : undefined,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { creator: true, category: true, episodes: true },
    });

    return contents.map((c) => this.mapContentToMobile(c));
  }

  async search(query: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      this.prisma.content.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { synopsis: { contains: query, mode: "insensitive" } },
            {
              creator: {
                displayName: { contains: query, mode: "insensitive" },
              },
            },
          ],
        },
        skip,
        take: limit,
        include: { creator: true, category: true, episodes: true },
      }),
      this.prisma.content.count({
        where: {
          isActive: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { synopsis: { contains: query, mode: "insensitive" } },
            {
              creator: {
                displayName: { contains: query, mode: "insensitive" },
              },
            },
          ],
        },
      }),
    ]);

    return {
      data: results.map((c) => this.mapContentToMobile(c)),
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}
