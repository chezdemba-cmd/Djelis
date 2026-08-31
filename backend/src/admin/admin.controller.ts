import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Post,
  Body,
  UseGuards,
  Inject,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { SignUploadDto } from "./dto/sign-upload.dto";
import { CreateContentDto } from "./dto/create-content.dto";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "SUPERADMIN")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Get("dashboard")
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get("contents")
  async getAllContents() {
    return this.adminService.getAllContents();
  }

  @Get("contents/:id/stats")
  async getContentStats(@Param("id") id: string) {
    return this.adminService.getContentStats(id);
  }

  @Patch("contents/:id/toggle")
  async toggleContentStatus(@Param("id") id: string) {
    const result = await this.adminService.toggleContentStatus(id);
    await this.cacheManager.del("catalog_home_feed");
    return result;
  }

  @Delete("contents/:id")
  async deleteContent(@Param("id") id: string) {
    const result = await this.adminService.deleteContent(id);
    await this.cacheManager.del("catalog_home_feed");
    return result;
  }

  // Étape 1 : le client demande une URL signée puis téléverse le fichier
  // directement vers Supabase Storage (le binaire ne passe pas par l'API).
  @Post("uploads/sign")
  async signUpload(@Body() dto: SignUploadDto) {
    return this.adminService.createSignedUpload(dto);
  }

  // Étape 2 : le client envoie uniquement les métadonnées + les chemins des
  // objets déjà téléversés. L'API vérifie leur présence avant d'enregistrer.
  @Post("contents")
  async createContent(@Body() dto: CreateContentDto) {
    const result = await this.adminService.createContent(dto);
    await this.cacheManager.del("catalog_home_feed");
    return result;
  }
}
