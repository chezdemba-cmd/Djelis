import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.profile.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  }

  async create(
    userId: string,
    data: { name: string; avatarUrl?: string; isChild?: boolean }
  ) {
    return this.prisma.profile.create({
      data: {
        userId,
        name: data.name,
        avatarUrl: data.avatarUrl || null,
        isChild: data.isChild || false,
      },
    });
  }

  async update(
    userId: string,
    id: string,
    data: { name?: string; avatarUrl?: string; isChild?: boolean }
  ) {
    const profile = await this.prisma.profile.findFirst({
      where: { id, userId },
    });
    if (!profile) {
      throw new NotFoundException("Profil non trouvé.");
    }
    return this.prisma.profile.update({
      where: { id },
      data: {
        name: data.name ?? profile.name,
        avatarUrl:
          data.avatarUrl !== undefined ? data.avatarUrl : profile.avatarUrl,
        isChild: data.isChild ?? profile.isChild,
      },
    });
  }

  async delete(userId: string, id: string) {
    const profile = await this.prisma.profile.findFirst({
      where: { id, userId },
    });
    if (!profile) {
      throw new NotFoundException("Profil non trouvé.");
    }
    await this.prisma.profile.delete({
      where: { id },
    });
    return { success: true };
  }
}
