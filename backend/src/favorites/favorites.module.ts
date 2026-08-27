import { Module } from "@nestjs/common";
import { FavoritesController } from "./favorites.controller";
import { PrismaService } from "../prisma.service";

@Module({
  controllers: [FavoritesController],
  providers: [PrismaService],
})
export class FavoritesModule {}
