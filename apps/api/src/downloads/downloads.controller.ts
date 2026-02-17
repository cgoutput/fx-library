import { Controller, Post, Param, Req, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DownloadsService } from './downloads.service';

@Controller('assets')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Post(':slug/versions/:versionId/download')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async download(
    @Param('slug') slug: string,
    @Param('versionId', ParseUUIDPipe) versionId: string,
    @CurrentUser('sub') userId: string,
    @Req() req: Request,
  ) {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const userAgent = req.headers['user-agent'];
    return this.downloadsService.download(slug, versionId, userId, ip, userAgent);
  }
}
