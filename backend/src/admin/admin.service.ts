import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const usersCount = await this.prisma.user.count();
    const activeSubsCount = await this.prisma.subscription.count({
      where: { status: 'ACTIVE' },
    });
    const videosCount = await this.prisma.content.count({
      where: { type: 'VIDEO' },
    });
    const audiosCount = await this.prisma.content.count({
      where: { type: 'AUDIO' },
    });

    return {
      users: usersCount,
      activeSubs: activeSubsCount,
      videos: videosCount,
      audios: audiosCount,
    };
  }

  async getAllContents() {
    return this.prisma.content.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
      }
    });
  }

  async toggleContentStatus(id: string) {
    const content = await this.prisma.content.findUnique({ where: { id } });
    if (!content) {
      throw new NotFoundException('Contenu non trouvé');
    }
    return this.prisma.content.update({
      where: { id },
      data: { isActive: !content.isActive },
    });
  }

  async deleteContent(id: string) {
    const content = await this.prisma.content.findUnique({ where: { id } });
    if (!content) {
      throw new NotFoundException('Contenu non trouvé');
    }
    return this.prisma.content.delete({
      where: { id },
    });
  }

  async createContent(data: any, files: { media?: Express.Multer.File[], cover?: Express.Multer.File[] }) {
    let category = await this.prisma.category.findFirst({ where: { name: data.category } });
    if (!category) {
      category = await this.prisma.category.findFirst();
    }
    const genre = await this.prisma.genre.findFirst();

    const contentType = data.type === 'Audio / Podcast' ? 'AUDIO' : 'VIDEO';
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const mediaUrl = files?.media && files.media.length > 0 ? `/uploads/${files.media[0].filename}` : null;
    const coverUrl = files?.cover && files.cover.length > 0 ? `/uploads/${files.cover[0].filename}` : '/assets/empire_mali.png';

    if (!mediaUrl) {
      throw new BadRequestException('Le fichier média est requis.');
    }

    const content = await this.prisma.content.create({
      data: {
        title: data.title,
        slug: slug,
        type: contentType,
        format: 'SINGLE',
        synopsis: data.synopsis || '',
        thumbnailUrl: coverUrl,
        categoryId: category?.id || 1,
        genreId: genre?.id || 1,
        publishedAt: data.publishedAtStart ? new Date(data.publishedAtStart) : new Date(),
        isActive: true,
      }
    });

    // Pour un contenu "SINGLE", le fichier média est souvent un Episode unique
    await this.prisma.episode.create({
      data: {
        contentId: content.id,
        title: data.title,
        episodeNumber: 1,
        seasonNumber: 1,
        duration: 0,
        cfStreamId: mediaUrl,
      }
    });

    return content;
  }
}
