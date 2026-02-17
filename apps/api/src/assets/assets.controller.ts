import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { assetListQuerySchema } from '@fx-library/shared';
import { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { AssetsService } from './assets.service';

@Controller()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get('assets')
  async findAll(@Query() query: Record<string, string>) {
    const parsed = assetListQuerySchema.parse(query);
    return this.assetsService.findAll(parsed);
  }

  @Get('assets/:slug')
  async findBySlug(@Param('slug') slug: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    const isAdmin = user?.role === 'ADMIN';
    return this.assetsService.findBySlug(slug, isAdmin);
  }

  @Get('tags')
  async findAllTags() {
    return this.assetsService.findAllTags();
  }
}
