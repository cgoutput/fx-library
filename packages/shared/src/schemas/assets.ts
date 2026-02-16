import { z } from 'zod';
import { Category, Difficulty, PreviewType, Renderer, OS, TagKind } from '../enums';

export const tagDto = z.object({
  id: z.string().uuid(),
  name: z.string(),
  kind: TagKind,
});
export type TagDto = z.infer<typeof tagDto>;

export const previewDto = z.object({
  id: z.string().uuid(),
  type: PreviewType,
  url: z.string(),
  sortOrder: z.number(),
});
export type PreviewDto = z.infer<typeof previewDto>;

export const assetVersionDto = z.object({
  id: z.string().uuid(),
  versionString: z.string(),
  houdiniMin: z.string(),
  houdiniMax: z.string().nullable(),
  renderer: Renderer,
  os: OS,
  notesMd: z.string().nullable(),
  fileSize: z.number(),
  createdAt: z.string().datetime(),
});
export type AssetVersionDto = z.infer<typeof assetVersionDto>;

export const assetListItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  summary: z.string(),
  category: Category,
  difficulty: Difficulty,
  downloadCount: z.number(),
  tags: z.array(tagDto),
  coverUrl: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export type AssetListItem = z.infer<typeof assetListItemSchema>;

export const assetListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  category: Category.optional(),
  difficulty: Difficulty.optional(),
  tags: z.string().optional(),
  searchQuery: z.string().optional(),
  sort: z.enum(['new', 'updated', 'popular']).default('new'),
});
export type AssetListQuery = z.infer<typeof assetListQuerySchema>;

export const assetDetailSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  summary: z.string(),
  descriptionMd: z.string().nullable(),
  howToMd: z.string().nullable(),
  breakdownMd: z.string().nullable(),
  category: Category,
  difficulty: Difficulty,
  status: z.string(),
  downloadCount: z.number(),
  publishedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  tags: z.array(tagDto),
  previews: z.array(previewDto),
  versions: z.array(assetVersionDto),
});
export type AssetDetail = z.infer<typeof assetDetailSchema>;

export const assetListResponseSchema = z.object({
  items: z.array(assetListItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});
export type AssetListResponse = z.infer<typeof assetListResponseSchema>;
