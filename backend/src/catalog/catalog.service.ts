import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ContentType } from '@prisma/client';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  // Separates landing page components into DjaaSoo (Video) and DjeliSon (Audio)
  async getHomeFeed(country?: string) {
    // 1. Fetch DjaaSoo (Video) assets
    const djaasooVideos = await this.prisma.content.findMany({
      where: {
        type: ContentType.VIDEO,
        isActive: true,
        // Check for geographical rights if country provided
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
      orderBy: { publishedAt: 'desc' },
      include: { creator: true, category: true },
    });

    // 2. Fetch DjeliSon (Audio) assets
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
      orderBy: { publishedAt: 'desc' },
      include: { creator: true, category: true },
    });

    return {
      djaasoo: {
        title: 'DjaaSoo - Vidéos & Cinéma',
        contents: djaasooVideos,
      },
      djelison: {
        title: 'DjeliSon - Musique & Podcasts',
        contents: djelisonAudios,
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
          orderBy: { episodeNumber: 'asc' },
        },
      },
    });

    if (!content || !content.isActive) {
      throw new NotFoundException('Contenu introuvable ou indisponible.');
    }

    return content;
  }

  async search(query: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      this.prisma.content.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { synopsis: { contains: query, mode: 'insensitive' } },
            { creator: { displayName: { contains: query, mode: 'insensitive' } } },
          ],
        },
        skip,
        take: limit,
        include: { creator: true, category: true },
      }),
      this.prisma.content.count({
        where: {
          isActive: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { synopsis: { contains: query, mode: 'insensitive' } },
            { creator: { displayName: { contains: query, mode: 'insensitive' } } },
          ],
        },
      }),
    ]);

    return {
      results,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}
