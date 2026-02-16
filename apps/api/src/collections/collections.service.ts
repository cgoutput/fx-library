import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, title: string) {
    return this.prisma.collection.create({
      data: { userId, title },
    });
  }

  async findAllByUser(userId: string) {
    const collections = await this.prisma.collection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { items: true } } },
    });

    return collections.map((c) => ({
      id: c.id,
      title: c.title,
      itemCount: c._count.items,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  }

  async findById(collectionId: string, userId: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        items: {
          include: {
            asset: {
              include: {
                tags: { include: { tag: true } },
                previews: { where: { sortOrder: 0 }, take: 1 },
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
      },
    });

    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.userId !== userId) throw new ForbiddenException();

    return {
      id: collection.id,
      title: collection.title,
      createdAt: collection.createdAt.toISOString(),
      updatedAt: collection.updatedAt.toISOString(),
      items: collection.items.map((item) => ({
        id: item.asset.id,
        title: item.asset.title,
        slug: item.asset.slug,
        summary: item.asset.summary,
        category: item.asset.category,
        difficulty: item.asset.difficulty,
        downloadCount: item.asset.downloadCount,
        tags: item.asset.tags.map((at) => ({
          id: at.tag.id,
          name: at.tag.name,
          kind: at.tag.kind,
        })),
        coverUrl: item.asset.previews[0]?.url ?? null,
        createdAt: item.asset.createdAt.toISOString(),
      })),
    };
  }

  async addItem(collectionId: string, assetId: string, userId: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });
    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.userId !== userId) throw new ForbiddenException();

    const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new NotFoundException('Asset not found');

    const existing = await this.prisma.collectionItem.findUnique({
      where: { collectionId_assetId: { collectionId, assetId } },
    });
    if (existing) throw new ConflictException('Asset already in collection');

    await this.prisma.collectionItem.create({
      data: { collectionId, assetId },
    });

    return { message: 'Added' };
  }

  async removeItem(collectionId: string, assetId: string, userId: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });
    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.userId !== userId) throw new ForbiddenException();

    await this.prisma.collectionItem.delete({
      where: { collectionId_assetId: { collectionId, assetId } },
    });

    return { message: 'Removed' };
  }
}
