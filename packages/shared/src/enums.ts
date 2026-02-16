import { z } from 'zod';

export const Role = z.enum(['USER', 'ADMIN']);
export type Role = z.infer<typeof Role>;

export const Category = z.enum([
  'PYRO',
  'FLIP',
  'VELLUM',
  'RBD',
  'PARTICLES',
  'OCEAN',
  'USD',
  'TOOLS',
  'OTHER',
]);
export type Category = z.infer<typeof Category>;

export const Difficulty = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);
export type Difficulty = z.infer<typeof Difficulty>;

export const AssetStatus = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export type AssetStatus = z.infer<typeof AssetStatus>;

export const PreviewType = z.enum(['IMAGE', 'VIDEO', 'GIF']);
export type PreviewType = z.infer<typeof PreviewType>;

export const Renderer = z.enum(['MANTRA', 'KARMA', 'REDSHIFT', 'OCTANE', 'ARNOLD', 'VRAY', 'NONE']);
export type Renderer = z.infer<typeof Renderer>;

export const OS = z.enum(['WINDOWS', 'LINUX', 'MACOS', 'ANY']);
export type OS = z.infer<typeof OS>;

export const TagKind = z.enum(['CATEGORY', 'TECHNIQUE', 'FEATURE']);
export type TagKind = z.infer<typeof TagKind>;

export const EventType = z.enum([
  'VIEW_ASSET',
  'SEARCH',
  'PLAY_PREVIEW',
  'DOWNLOAD_ATTEMPT',
  'DOWNLOAD_SUCCESS',
  'ADD_TO_COLLECTION',
]);
export type EventType = z.infer<typeof EventType>;
