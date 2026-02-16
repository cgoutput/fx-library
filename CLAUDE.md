# FX Library — Houdini Asset Management System

## Project Overview
A free library for Houdini FX assets. Public browsing, login required for downloads and collections. Admin panel for asset management.

## Tech Stack
- **Monorepo**: pnpm + turborepo
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Frontend**: Next.js (App Router), TypeScript, TailwindCSS, TanStack Query
- **Database**: Supabase Postgres
- **Storage**: Supabase Storage (buckets: `previews` public, `assets` private)
- **Auth**: Custom JWT (argon2 + access/refresh tokens), NOT Supabase Auth
- **Shared**: Zod schemas for DTO validation in `packages/shared`

## Repo Structure
```
/apps/web          — Next.js frontend
/apps/api          — NestJS backend
/packages/shared   — shared types + Zod schemas
```

## Key Architecture Decisions
- Auth: custom JWT. Access token 15min, refresh token 30d in httpOnly cookie with rotation.
- Downloads: signed URLs from Supabase Storage, TTL 120 sec. Auth required.
- Search: Postgres ILIKE + trigram for MVP. No Meilisearch yet.
- Rate limiting: in-memory (@nestjs/throttler), no Redis for MVP.
- Storage paths: `previews/{assetId}/{previewId}/{filename}` and `assets/{assetId}/versions/{versionId}/{filename}.zip`
- CSRF: sameSite=strict cookies for MVP.
- IP logging: sha256(ip + serverSalt), never raw IP.

## Database Models
User, Asset, AssetVersion, Preview, Tag, AssetTag, Collection, CollectionItem, Download, Event.
See `FULL-STACK_BUILD_INSTR.txt` section 4 for full schema.

## API Routes
- Public: GET /v1/assets, /v1/assets/:slug, /v1/tags, POST /v1/events
- Auth: POST /v1/auth/register, /login, /logout, /refresh, GET /v1/me
- User: CRUD /v1/collections
- Download: POST /v1/assets/:slug/versions/:versionId/download
- Admin: CRUD /v1/admin/assets, upload previews/versions, publish/unpublish

## Build Order (12 blocks)
1. Monorepo scaffold
2. Prisma schema + shared types + seed
3. Auth backend (JWT, guards)
4. Assets API (public endpoints)
5. Storage + Downloads (Supabase integration)
6. Events + Collections API
7. Admin API + Swagger
8. Frontend: API client + auth UI
9. Frontend: catalog + asset page
10. Frontend: collections + profile
11. Frontend: admin panel
12. Hardening + deploy docs

## Code Style
- TypeScript strict mode
- Zod for all DTO validation (shared between frontend and backend)
- Prisma for all DB access (no raw SQL unless necessary)
- NestJS modules: one module per domain (auth, assets, storage, events, collections, admin)
- Next.js App Router with server components where possible
- TailwindCSS for styling, dark theme, minimal design

## Env Vars (API)
DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, APP_ORIGIN, IP_HASH_SALT

## Env Vars (Web)
NEXT_PUBLIC_API_BASE_URL

## Commands
- `pnpm dev` — start all apps in dev mode
- `pnpm build` — build all
- `pnpm lint` — lint all
- `pnpm db:migrate` — run prisma migrations (from apps/api)
- `pnpm db:seed` — seed database (from apps/api)
