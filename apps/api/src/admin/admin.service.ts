import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import type { CreateAssetDto, UpdateAssetDto } from '@fx-library/shared';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async createAsset(dto: CreateAssetDto) {
    const slug = slugify(dto.title);

    // Ensure unique slug
    const existing = await this.prisma.asset.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const { tagIds, ...data } = dto;

    const asset = await this.prisma.asset.create({
      data: {
        ...data,
        slug: finalSlug,
        tags: tagIds?.length ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
      },
      include: { tags: { include: { tag: true } } },
    });

    return asset;
  }

  async updateAsset(id: string, dto: UpdateAssetDto) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found');

    const { tagIds, ...data } = dto;

    // If tagIds provided, replace all tags
    if (tagIds !== undefined) {
      await this.prisma.assetTag.deleteMany({ where: { assetId: id } });
      if (tagIds.length > 0) {
        await this.prisma.assetTag.createMany({
          data: tagIds.map((tagId) => ({ assetId: id, tagId })),
        });
      }
    }

    // Update slug if title changed
    const updateData: Record<string, unknown> = { ...data };
    if (dto.title && dto.title !== asset.title) {
      updateData.slug = slugify(dto.title);
    }

    const updated = await this.prisma.asset.update({
      where: { id },
      data: updateData,
      include: { tags: { include: { tag: true } } },
    });

    return updated;
  }

  async publish(id: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found');

    return this.prisma.asset.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
  }

  async unpublish(id: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found');

    return this.prisma.asset.update({
      where: { id },
      data: { status: 'DRAFT' },
    });
  }
}
