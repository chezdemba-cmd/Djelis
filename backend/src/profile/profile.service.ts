import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.withUser(userId).profile.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  }

  async create(
    userId: string,
    data: { name: string; avatarUrl?: string; isChild?: boolean }
  ) {
    return this.prisma.withUser(userId).profile.create({
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
    const prismaRLS = this.prisma.withUser(userId);
    const profile = await prismaRLS.profile.findFirst({
      where: { id, userId },
    });
    if (!profile) {
      throw new NotFoundException("Profil non trouvé.");
    }
    return prismaRLS.profile.update({
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
    const prismaRLS = this.prisma.withUser(userId);
    const profile = await prismaRLS.profile.findFirst({
      where: { id, userId },
    });
    if (!profile) {
      throw new NotFoundException("Profil non trouvé.");
    }
    await prismaRLS.profile.delete({
      where: { id },
    });
    return { success: true };
  }
}
