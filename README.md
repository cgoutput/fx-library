# FX Library

A free library for Houdini FX assets. Public browsing, login required for downloads and collections. Admin panel for asset management.

## Tech Stack

- **Monorepo**: pnpm + Turborepo
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Frontend**: Next.js (App Router), TypeScript, TailwindCSS, TanStack Query
- **Database**: Supabase Postgres
- **Storage**: Supabase Storage (buckets: `previews` public, `assets` private)
- **Auth**: Custom JWT (argon2 + access/refresh tokens)
- **Shared**: Zod schemas for DTO validation

## Repo Structure

```
apps/
  api/          — NestJS backend (port 4000)
  web/          — Next.js frontend (port 3000)
packages/
  shared/       — Shared types + Zod schemas
```

## Prerequisites

- Node.js >= 18
- pnpm >= 9
- Supabase project (Postgres + Storage)

## Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Configure environment variables**

   Copy the example env files and fill in your values:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

   See [Environment Variables](#environment-variables) below for details.

3. **Run database migrations**

   ```bash
   pnpm db:migrate
   ```

4. **Seed the database** (optional, creates demo data)

   ```bash
   pnpm db:seed
   ```

5. **Start development servers**

   ```bash
   pnpm dev
   ```

   - API: http://localhost:4000
   - Web: http://localhost:3000
   - Swagger docs: http://localhost:4000/docs

## Scripts

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `pnpm dev`        | Start all apps in dev mode          |
| `pnpm build`      | Build all packages                  |
| `pnpm lint`       | Lint all packages                   |
| `pnpm db:migrate` | Run Prisma migrations (from api)    |
| `pnpm db:seed`    | Seed the database (from api)        |

## Environment Variables

### API (`apps/api/.env`)

| Variable                     | Description                              |
| ---------------------------- | ---------------------------------------- |
| `DATABASE_URL`               | Supabase Postgres connection string      |
| `JWT_ACCESS_SECRET`          | Secret for access token signing          |
| `JWT_REFRESH_SECRET`         | Secret for refresh token signing         |
| `SUPABASE_URL`               | Supabase project URL                     |
| `SUPABASE_SERVICE_ROLE_KEY`  | Supabase service role key                |
| `APP_ORIGIN`                 | Frontend URL for CORS (e.g. `http://localhost:3000`) |
| `IP_HASH_SALT`               | Salt for hashing IP addresses            |
| `PORT`                       | API port (default: 4000)                 |

### Web (`apps/web/.env`)

| Variable                    | Description                              |
| --------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`  | API URL (e.g. `http://localhost:4000/v1`) |

## Default Seed Credentials

- **Admin**: admin@fxlibrary.com / admin123

## License

Private — all rights reserved.
