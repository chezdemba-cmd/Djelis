import { Controller, Get, Patch, Param, Delete, Post, Body, UseInterceptors, UploadedFiles, Inject } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller('v1/admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('contents')
  async getAllContents() {
    return this.adminService.getAllContents();
  }

  @Patch('contents/:id/toggle')
  async toggleContentStatus(@Param('id') id: string) {
    const result = await this.adminService.toggleContentStatus(id);
    await this.cacheManager.del('catalog_home_feed');
    return result;
  }

  @Delete('contents/:id')
  async deleteContent(@Param('id') id: string) {
    const result = await this.adminService.deleteContent(id);
    await this.cacheManager.del('catalog_home_feed');
    return result;
  }

  @Post('contents')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'media', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ], {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      }
    })
  }))
  async createContent(
    @Body() createDto: any,
    @UploadedFiles() files: { media?: Express.Multer.File[], cover?: Express.Multer.File[] }
  ) {
    const result = await this.adminService.createContent(createDto, files);
    await this.cacheManager.del('catalog_home_feed');
    return result;
  }
}
