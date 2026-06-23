import { Controller, Get, Param, Query, ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller(['catalog', 'catalogue'])
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get('home')
  async getHomeFeed(@Query('country') country?: string) {
    return this.catalogService.getHomeFeed(country);
  }

  @Get('featured')
  async getFeatured(@Query('country') country?: string) {
    return this.catalogService.getFeatured(country);
  }

  @Get('contents')
  async getContents(
    @Query('type') type?: string,
    @Query('category') categoryId?: string,
    @Query('country') countryCode?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.catalogService.getContents(type, categoryId, countryCode, pageNum, limitNum);
  }

  @Get('contents/:id')
  async getContentById(@Param('id') id: string) {
    return this.catalogService.getContentDetail(id);
  }

  @Get('popular')
  async getPopular(@Query('country') country?: string) {
    return this.catalogService.getPopular(country);
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.catalogService.search(query || '', pageNum, limitNum);
  }
}
