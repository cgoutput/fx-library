# FX Library — Prompts for Claude Code
# Copy-paste each block one at a time. Wait for completion, review, commit, then proceed.
# Full spec is in FULL-STACK_BUILD_INSTR.txt — reference it for details.

============================================================
BLOCK 1 — MONOREPO SCAFFOLD
============================================================

Read CLAUDE.md and FULL-STACK_BUILD_INSTR.txt in this directory.

Create a pnpm + turborepo monorepo with this structure:
- apps/web: Next.js 14+ App Router, TypeScript, TailwindCSS, TanStack Query (@tanstack/react-query)
- apps/api: NestJS, TypeScript
- packages/shared: TypeScript library for shared Zod schemas and types

Setup:
- pnpm-workspace.yaml
- turbo.json with pipelines: dev, build, lint
- Root package.json with scripts: dev, build, lint
- Shared tsconfig base in root
- ESLint + Prettier configs (shared)
- .env.example files for both apps (see CLAUDE.md for env vars)
- .gitignore

Make sure `pnpm install` and `pnpm dev` work. Commit when done.


============================================================
BLOCK 2 — PRISMA + SHARED TYPES + SEED
============================================================

In apps/api:
- Add Prisma, configure for Supabase Postgres using DATABASE_URL from .env
- Create the full Prisma schema with ALL models from FULL-STACK_BUILD_INSTR.txt section 4:
  User, Asset, AssetVersion, Preview, Tag, AssetTag, Collection, CollectionItem, Download, Event
- Include all enums: Role, Category, Difficulty, AssetStatus, PreviewType, Renderer, OS, TagKind, EventType
- Add proper indexes: Asset.slug (unique), User.email (unique), Tag.name (unique), composite keys for AssetTag and CollectionItem
- Generate Prisma client

In packages/shared:
- Create Zod schemas for all DTOs used in API:
  - Auth: RegisterDto, LoginDto, AuthResponse, UserProfile
  - Assets: AssetListQuery, AssetListResponse, AssetDetail, AssetVersionDto, PreviewDto, TagDto
  - Collections: CreateCollectionDto, AddCollectionItemDto, CollectionResponse
  - Events: CreateEventDto
  - Admin: CreateAssetDto, UpdateAssetDto, CreateVersionDto
- Export TypeScript types inferred from Zod schemas

In apps/api create seed script (prisma/seed.ts):
- 1 admin user (admin@fxlibrary.com, password: admin123)
- 10 tags: pyro, flip, vellum, rbd, particles, ocean, usd, tools, retime-safe, optimization
- 5 demo assets with proper categories, 2 versions each, placeholder previews
- Wire up tags to assets

Run `npx prisma generate`. Commit when done.


============================================================
BLOCK 3 — AUTH BACKEND
============================================================

In apps/api create auth module (src/auth/):
- AuthModule, AuthController, AuthService
- Password hashing with argon2
- JWT access token (15 min) signed with JWT_ACCESS_SECRET
- JWT refresh token (30 days) signed with JWT_REFRESH_SECRET
- Refresh token stored in httpOnly cookie (sameSite: strict, secure: true in prod)
- Token rotation on refresh (old refresh token invalidated)

Endpoints:
- POST /v1/auth/register — email + password, returns access token + sets refresh cookie
- POST /v1/auth/login — email + password, returns access token + sets refresh cookie
- POST /v1/auth/logout — clears refresh cookie
- POST /v1/auth/refresh — reads refresh cookie, rotates, returns new access token
- GET /v1/me — returns current user profile (requires auth)

Guards:
- JwtAuthGuard — validates access token from Authorization: Bearer header
- RolesGuard — checks user role (decorator: @Roles('ADMIN'))

Use Zod DTOs from packages/shared for validation. Add rate limiting to auth routes.
Commit when done.


============================================================
BLOCK 4 — ASSETS PUBLIC API
============================================================

In apps/api create assets module (src/assets/):
- AssetsModule, AssetsController, AssetsService

Endpoints:
- GET /v1/assets
  Query params: page (default 1), pageSize (default 20), category, difficulty, tags (comma-separated), searchQuery, sort (new|updated|popular)
  - Search: Postgres ILIKE on title + summary for MVP
  - Sort "popular" = order by download count
  - Returns paginated list with total count
  - Only return PUBLISHED assets

- GET /v1/assets/:slug
  - Returns full asset with versions, previews, tags
  - Only PUBLISHED assets (or any for ADMIN)

- GET /v1/tags
  - Returns all tags grouped by kind

Use Prisma for all queries. Type responses with shared DTOs.
Commit when done.


============================================================
BLOCK 5 — SUPABASE STORAGE + DOWNLOADS
============================================================

In apps/api create storage module (src/storage/):
- SupabaseStorageService — wraps @supabase/supabase-js admin client
  - Uses SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
  - Methods: uploadFile, deleteFile, getSignedUrl

Admin upload endpoints (require ADMIN role):
- POST /v1/admin/assets/:id/previews
  - Multipart file upload (image/video/gif)
  - Uploads to "previews" bucket: previews/{assetId}/{previewId}/{filename}
  - Creates Preview row in DB
  - Accept sortOrder, type in form fields

- POST /v1/admin/assets/:id/versions
  - Multipart zip upload + metadata fields (versionString, houdiniMin, houdiniMax, renderer, os, notesMd)
  - Uploads to "assets" bucket: assets/{assetId}/versions/{versionId}/{filename}.zip
  - Compute sha256 hash + file size
  - Creates AssetVersion row in DB

Download endpoint (require auth):
- POST /v1/assets/:slug/versions/:versionId/download
  - Validate user is authenticated
  - Create Download row (userId, assetVersionId, ipHash, userAgent)
  - Create Event rows (DOWNLOAD_ATTEMPT, then DOWNLOAD_SUCCESS)
  - Generate signed URL from Supabase Storage, TTL 120 seconds
  - Return { url, expiresInSec: 120 }
  - Rate limit this endpoint

Commit when done.


============================================================
BLOCK 6 — EVENTS + COLLECTIONS API
============================================================

Events module (src/events/):
- POST /v1/events
  - Anonymous allowed (attach userId if authenticated)
  - Body: { type: EventType, payload: object }
  - Validate type is one of: VIEW_ASSET, SEARCH, PLAY_PREVIEW, DOWNLOAD_ATTEMPT, DOWNLOAD_SUCCESS, ADD_TO_COLLECTION
  - Store Event row
  - Rate limit: strict (e.g. 30 per minute per IP)

Collections module (src/collections/):
- POST /v1/collections — create collection (title). Auth required.
- GET /v1/collections — list user's collections with item count. Auth required.
- GET /v1/collections/:id — get collection with assets. Auth required. Only own collections.
- POST /v1/collections/:id/items — add asset to collection. Body: { assetId }. Auth required.
- DELETE /v1/collections/:id/items/:assetId — remove asset from collection. Auth required.

Commit when done.


============================================================
BLOCK 7 — ADMIN API + SWAGGER
============================================================

Admin module (src/admin/):
All endpoints require ADMIN role.

- POST /v1/admin/assets — create asset (title, summary, category, difficulty, etc). Auto-generate slug from title.
- PATCH /v1/admin/assets/:id — update asset fields
- POST /v1/admin/assets/:id/publish — set status=PUBLISHED, set publishedAt
- POST /v1/admin/assets/:id/unpublish — set status=DRAFT

Add to apps/api:
- Swagger/OpenAPI at /docs (use @nestjs/swagger)
- CORS configuration: allow only APP_ORIGIN env var
- Global validation pipe using Zod
- Health check endpoint: GET /health

Update main.ts with all security settings.
Commit when done.


============================================================
BLOCK 8 — FRONTEND: API CLIENT + AUTH UI
============================================================

In apps/web:
- Create API client (src/lib/api.ts):
  - Base URL from NEXT_PUBLIC_API_BASE_URL
  - Axios or fetch wrapper
  - Auto-attach access token from memory (not localStorage!)
  - On 401: attempt silent refresh via /v1/auth/refresh, retry original request
  - If refresh fails: clear token, redirect to /login

- Auth context/store (src/lib/auth.ts):
  - Store access token in memory (React state/context)
  - User profile state
  - login(), register(), logout(), refresh() methods

- TanStack Query provider setup

- Pages:
  - /login — email + password form, link to register
  - /register — email + password form, link to login
  - Layout with header: logo, nav (Catalog, Collections if logged in, Admin if admin), user menu

- Design: dark theme, minimal. Use the design tokens from the prototype (JetBrains Mono for code/labels, DM Sans for body).

Commit when done.


============================================================
BLOCK 9 — FRONTEND: CATALOG + ASSET PAGE
============================================================

In apps/web:

/assets page:
- Filter bar: search input, category dropdown, difficulty dropdown, sort dropdown
- Tag filter chips (toggleable)
- Asset grid (responsive cards)
- Pagination
- Card shows: cover placeholder, title, summary, category badge, difficulty, tags, download count
- Use TanStack Query with proper cache keys

/assets/[slug] page:
- Hero preview area (placeholder for video/image)
- Asset title, summary, badges (category, difficulty)
- Quick facts grid: Houdini version, renderer, downloads, views
- Tabs:
  - Versions — list with download buttons. If not logged in, download button opens login modal.
  - How to Use — render howToMd with react-markdown
  - Breakdown — render breakdownMd with react-markdown
- Save/favorite button (requires auth)
- Related assets section (same category, limit 4)

- Track VIEW_ASSET event on page load (POST /v1/events)

Commit when done.


============================================================
BLOCK 10 — FRONTEND: COLLECTIONS + PROFILE
============================================================

In apps/web:

/me page:
- User profile info (email, role, member since)
- List of collections with asset count
- "New Collection" button

/collections/[id] page:
- Collection title
- Grid of assets in collection
- Remove button on each asset card
- Back link to /me

- "Add to Collection" flow: on asset detail page, button opens modal to select collection or create new one

All collection pages require auth — redirect to /login if not authenticated.

Commit when done.


============================================================
BLOCK 11 — FRONTEND: ADMIN PANEL
============================================================

In apps/web:

/admin page:
- Dashboard: total assets, published count, total downloads (can be placeholder stats)

/admin/assets page:
- Table of all assets (any status): title, slug, category, status, downloads, actions
- Actions: Edit, Publish/Unpublish

/admin/assets/new page:
- Form: title (auto-slug), summary, category, difficulty, descriptionMd, howToMd, breakdownMd
- Markdown fields as textarea (MVP, no rich editor)
- Tag selection (checkboxes or multi-select)
- Save as draft

/admin/assets/[id] page:
- Same form as /new but pre-filled
- Section: Upload Previews (image/video files with sortOrder)
- Section: Upload Version (zip file + houdiniMin, houdiniMax, versionString, renderer, os, notesMd)
- Publish / Unpublish button
- List existing previews and versions with delete option

Protect all /admin routes — redirect non-admin users.

Commit when done.


============================================================
BLOCK 12 — HARDENING + DEPLOY DOCS
============================================================

Backend hardening:
- Helmet for security headers
- CORS strict to APP_ORIGIN only
- Rate limiting on all sensitive routes (already done, verify)
- Request logging (basic NestJS logger)

Frontend hardening:
- Next.js security headers in next.config.js
- CSP header (basic)
- No sensitive data in client bundle

Create docs:
- README.md in root: project overview, setup instructions, env vars
- DEPLOY.md: step-by-step deployment guide:
  - Supabase: create project, buckets, get keys
  - API: deploy to Render/Fly.io/Railway
  - Web: deploy to Vercel
  - Environment variables for each service
- CHECKLIST.md: acceptance criteria from spec section 13:
  - [ ] Guest can browse catalog
  - [ ] Guest cannot download
  - [ ] Logged in user can download via signed URL
  - [ ] User can manage collections
  - [ ] Admin can create/edit/publish assets
  - [ ] Admin can upload previews and versions
  - [ ] Events and downloads are recorded

Final: run `pnpm build` and fix any errors.
Commit when done.
