import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
import { PrismaService } from "../prisma.service";
import { StreamController } from "./stream.controller";

@Module({
  imports: [CacheModule.register()],
  controllers: [CatalogController, StreamController],
  providers: [CatalogService, PrismaService],
  exports: [CatalogService],
})
export class CatalogModule {}
