import { z } from 'zod';
import { assetListItemSchema } from './assets';

export const createCollectionDto = z.object({
  title: z.string().min(1).max(200),
});
export type CreateCollectionDto = z.infer<typeof createCollectionDto>;

export const addCollectionItemDto = z.object({
  assetId: z.string().uuid(),
});
export type AddCollectionItemDto = z.infer<typeof addCollectionItemDto>;

export const collectionResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  itemCount: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type CollectionResponse = z.infer<typeof collectionResponseSchema>;

export const collectionDetailSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  items: z.array(assetListItemSchema),
});
export type CollectionDetail = z.infer<typeof collectionDetailSchema>;
