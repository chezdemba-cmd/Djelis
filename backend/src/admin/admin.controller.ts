import { Controller, Get, Patch, Param, Delete, Post, Body, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
    return this.adminService.toggleContentStatus(id);
  }

  @Delete('contents/:id')
  async deleteContent(@Param('id') id: string) {
    return this.adminService.deleteContent(id);
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
    return this.adminService.createContent(createDto, files);
  }
}
