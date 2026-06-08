import { Controller, Get, Param, Query, ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get('home')
  async getHomeFeed(@Query('country') country?: string) {
    return this.catalogService.getHomeFeed(country);
  }

  @Get('contents/:id')
  async getContentById(@Param('id', ParseUUIDPipe) id: string) {
    return this.catalogService.getContentById(id);
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
