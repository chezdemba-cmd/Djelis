import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  Post,
  Body,
  UseInterceptors,
  UseGuards,
  UploadedFiles,
  Inject,
  UnsupportedMediaTypeException,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { AdminService } from "./admin.service";
import { diskStorage } from "multer";
import { extname } from "path";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

const ALLOWED_MEDIA_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
];
const ALLOWED_COVER_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_MEDIA_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2 Go (limite globale de l'interceptor)
const UPLOADS_DIRECTORY = process.env.VERCEL ? "/tmp/uploads" : "./uploads";

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

  @Post("contents")
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "media", maxCount: 1 },
        { name: "cover", maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: UPLOADS_DIRECTORY,
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(
              null,
              `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`
            );
          },
        }),
        fileFilter: (req, file, cb) => {
          const allowed =
            file.fieldname === "cover"
              ? ALLOWED_COVER_MIME_TYPES
              : ALLOWED_MEDIA_MIME_TYPES;
          if (!allowed.includes(file.mimetype)) {
            return cb(
              new UnsupportedMediaTypeException(
                `Type de fichier non autorisé pour "${file.fieldname}": ${file.mimetype}`
              ),
              false
            );
          }
          cb(null, true);
        },
        limits: {
          fileSize: MAX_MEDIA_SIZE_BYTES,
        },
      }
    )
  )
  async createContent(
    @Body() createDto: any,
    @UploadedFiles()
    files: { media?: Express.Multer.File[]; cover?: Express.Multer.File[] }
  ) {
    const result = await this.adminService.createContent(createDto, files);
    await this.cacheManager.del("catalog_home_feed");
    return result;
  }
}
