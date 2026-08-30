import { Module } from "@nestjs/common";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
import { StreamController } from "./stream.controller";

@Module({
  imports: [],
  controllers: [CatalogController, StreamController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
