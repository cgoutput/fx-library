import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';
import type { AssetListQuery } from '@fx-library/shared';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AssetListQuery) {
    const { page, pageSize, category, difficulty, tags, searchQuery, sort } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.AssetWhereInput = {
      status: 'PUBLISHED',
    };

    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { summary: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    if (tags) {
      const tagNames = tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagNames.length > 0) {
        where.tags = {
          some: {
            tag: { name: { in: tagNames } },
          },
        };
      }
    }

    let orderBy: Prisma.AssetOrderByWithRelationInput;
    switch (sort) {
      case 'popular':
        orderBy = { downloadCount: 'desc' };
        break;
      case 'updated':
        orderBy = { updatedAt: 'desc' };
        break;
      case 'new':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [items, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          tags: { include: { tag: true } },
          previews: { where: { sortOrder: 0 }, take: 1 },
        },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      items: items.map((asset) => ({
        id: asset.id,
        title: asset.title,
        slug: asset.slug,
        summary: asset.summary,
        category: asset.category,
        difficulty: asset.difficulty,
        downloadCount: asset.downloadCount,
        tags: asset.tags.map((at) => ({
          id: at.tag.id,
          name: at.tag.name,
          kind: at.tag.kind,
        })),
        coverUrl: asset.previews[0]?.url ?? null,
        createdAt: asset.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findBySlug(slug: string, isAdmin: boolean) {
    const where: Prisma.AssetWhereInput = { slug };
    if (!isAdmin) {
      where.status = 'PUBLISHED';
    }

    const asset = await this.prisma.asset.findFirst({
      where,
      include: {
        tags: { include: { tag: true } },
        previews: { orderBy: { sortOrder: 'asc' } },
        versions: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return {
      id: asset.id,
      title: asset.title,
      slug: asset.slug,
      summary: asset.summary,
      descriptionMd: asset.descriptionMd,
      howToMd: asset.howToMd,
      breakdownMd: asset.breakdownMd,
      category: asset.category,
      difficulty: asset.difficulty,
      status: asset.status,
      downloadCount: asset.downloadCount,
      publishedAt: asset.publishedAt?.toISOString() ?? null,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
      tags: asset.tags.map((at) => ({
        id: at.tag.id,
        name: at.tag.name,
        kind: at.tag.kind,
      })),
      previews: asset.previews.map((p) => ({
        id: p.id,
        type: p.type,
        url: p.url,
        sortOrder: p.sortOrder,
      })),
      versions: asset.versions.map((v) => ({
        id: v.id,
        versionString: v.versionString,
        houdiniMin: v.houdiniMin,
        houdiniMax: v.houdiniMax,
        renderer: v.renderer,
        os: v.os,
        notesMd: v.notesMd,
        fileSize: v.fileSize,
        createdAt: v.createdAt.toISOString(),
      })),
    };
  }

  async findAllTags() {
    const tags = await this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });

    const grouped: Record<string, { id: string; name: string; kind: string }[]> = {};
    for (const tag of tags) {
      if (!grouped[tag.kind]) grouped[tag.kind] = [];
      grouped[tag.kind].push({ id: tag.id, name: tag.name, kind: tag.kind });
    }

    return grouped;
  }
}
