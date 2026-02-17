import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma';
import { SupabaseStorageService } from '../storage';

@Injectable()
export class DownloadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: SupabaseStorageService,
    private readonly config: ConfigService,
  ) {}

  async download(
    slug: string,
    versionId: string,
    userId: string,
    ip: string,
    userAgent: string | undefined,
  ) {
    // Find the asset and version
    const asset = await this.prisma.asset.findUnique({
      where: { slug },
    });
    if (!asset) throw new NotFoundException('Asset not found');

    const version = await this.prisma.assetVersion.findFirst({
      where: { id: versionId, assetId: asset.id },
    });
    if (!version) throw new NotFoundException('Version not found');

    // Hash IP
    const salt = this.config.get<string>('IP_HASH_SALT', 'default-salt');
    const ipHash = crypto
      .createHash('sha256')
      .update(ip + salt)
      .digest('hex');

    // Record download attempt event
    await this.prisma.event.create({
      data: {
        type: 'DOWNLOAD_ATTEMPT',
        userId,
        payload: { assetId: asset.id, versionId },
      },
    });

    // Generate signed URL
    const signedUrl = await this.storage.getSignedUrl('assets', version.filePath, 120);

    // Create download record
    await this.prisma.download.create({
      data: {
        userId,
        assetVersionId: versionId,
        ipHash,
        userAgent: userAgent ?? null,
      },
    });

    // Increment download count
    await this.prisma.asset.update({
      where: { id: asset.id },
      data: { downloadCount: { increment: 1 } },
    });

    // Record download success event
    await this.prisma.event.create({
      data: {
        type: 'DOWNLOAD_SUCCESS',
        userId,
        payload: { assetId: asset.id, versionId },
      },
    });

    return { url: signedUrl, expiresInSec: 120 };
  }
}
