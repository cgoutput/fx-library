import { z } from 'zod';
import { Category, Difficulty, Renderer, OS } from '../enums';

export const createAssetDto = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(500),
  category: Category,
  difficulty: Difficulty,
  descriptionMd: z.string().optional(),
  howToMd: z.string().optional(),
  breakdownMd: z.string().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});
export type CreateAssetDto = z.infer<typeof createAssetDto>;

export const updateAssetDto = z.object({
  title: z.string().min(1).max(200).optional(),
  summary: z.string().min(1).max(500).optional(),
  category: Category.optional(),
  difficulty: Difficulty.optional(),
  descriptionMd: z.string().nullable().optional(),
  howToMd: z.string().nullable().optional(),
  breakdownMd: z.string().nullable().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});
export type UpdateAssetDto = z.infer<typeof updateAssetDto>;

export const createVersionDto = z.object({
  versionString: z.string().min(1),
  houdiniMin: z.string().min(1),
  houdiniMax: z.string().optional(),
  renderer: Renderer.default('NONE'),
  os: OS.default('ANY'),
  notesMd: z.string().optional(),
});
export type CreateVersionDto = z.infer<typeof createVersionDto>;
