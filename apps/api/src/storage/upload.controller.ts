import {
  Controller,
  Post,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as crypto from 'crypto';
import { OS, Renderer } from '@fx-library/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../prisma';
import { SupabaseStorageService } from './supabase-storage.service';

@Controller('admin/assets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UploadController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: SupabaseStorageService,
  ) {}

  @Post(':id/previews')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPreview(
    @Param('id', ParseUUIDPipe) assetId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('sortOrder') sortOrderRaw: string,
    @Body('type') type: string,
  ) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('Asset not found');

    const previewId = crypto.randomUUID();
    const sortOrder = parseInt(sortOrderRaw, 10) || 0;
    const previewType = (
      ['IMAGE', 'VIDEO', 'GIF'].includes(type?.toUpperCase()) ? type.toUpperCase() : 'IMAGE'
    ) as 'IMAGE' | 'VIDEO' | 'GIF';
    const filePath = `previews/${assetId}/${previewId}/${file.originalname}`;

    await this.storage.uploadFile('previews', filePath, file.buffer, file.mimetype);

    const preview = await this.prisma.preview.create({
      data: {
        id: previewId,
        assetId,
        type: previewType,
        url: filePath,
        sortOrder,
      },
    });

    return preview;
  }

  @Post(':id/versions')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVersion(
    @Param('id', ParseUUIDPipe) assetId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('versionString') versionString: string,
    @Body('houdiniMin') houdiniMin: string,
    @Body('houdiniMax') houdiniMax: string,
    @Body('renderer') renderer: string,
    @Body('os') os: string,
    @Body('notesMd') notesMd: string,
  ) {
    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('Asset not found');

    const versionId = crypto.randomUUID();
    const filePath = `assets/${assetId}/versions/${versionId}/${file.originalname}`;
    const sha256 = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const fileSize = file.size;

    await this.storage.uploadFile('assets', filePath, file.buffer, file.mimetype);

    const validRenderers: readonly Renderer[] = [
      'MANTRA',
      'KARMA',
      'REDSHIFT',
      'OCTANE',
      'ARNOLD',
      'VRAY',
      'NONE',
    ];
    const validOs: readonly OS[] = ['WINDOWS', 'LINUX', 'MACOS', 'ANY'];
    const normalizedRenderer = renderer?.toUpperCase() as Renderer | undefined;
    const normalizedOs = os?.toUpperCase() as OS | undefined;
    const rendererValue: Renderer =
      normalizedRenderer && validRenderers.includes(normalizedRenderer)
        ? normalizedRenderer
        : 'NONE';
    const osValue: OS = normalizedOs && validOs.includes(normalizedOs) ? normalizedOs : 'ANY';

    const version = await this.prisma.assetVersion.create({
      data: {
        id: versionId,
        assetId,
        versionString,
        houdiniMin,
        houdiniMax: houdiniMax || null,
        renderer: rendererValue,
        os: osValue,
        notesMd: notesMd || null,
        filePath,
        fileSize,
        sha256,
      },
    });

    return version;
  }
}
