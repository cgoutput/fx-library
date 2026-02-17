# Deployment Guide

## 1. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Note your **Project URL** and **Service Role Key** from Settings > API
3. Note your **Database URL** from Settings > Database > Connection string (URI)

### Storage Buckets

Create two storage buckets in Supabase Dashboard > Storage:

- **`previews`** — Public bucket (enable public access)
- **`assets`** — Private bucket (keep private, signed URLs used for downloads)

### Database

The Postgres database is managed by Supabase. Run Prisma migrations against it:

```bash
DATABASE_URL="your-supabase-connection-string" pnpm db:migrate
```

Optionally seed with demo data:

```bash
DATABASE_URL="your-supabase-connection-string" pnpm db:seed
```

## 2. API Deployment (Render / Fly.io / Railway)

### Render

1. Create a new **Web Service** from your repo
2. Set **Root Directory**: `apps/api`
3. **Build Command**: `cd ../.. && pnpm install && pnpm build --filter @fx-library/api`
4. **Start Command**: `node dist/main`
5. Set environment variables (see below)

### Fly.io

1. Create a `fly.toml` in `apps/api/`
2. Deploy with `fly deploy`
3. Set secrets via `fly secrets set KEY=VALUE`

### Railway

1. Connect your repo
2. Set **Root Directory**: `apps/api`
3. Railway auto-detects Node.js
4. Set environment variables in the dashboard

### API Environment Variables

```
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=<random-64-char-string>
JWT_REFRESH_SECRET=<random-64-char-string>
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
APP_ORIGIN=https://your-frontend-domain.vercel.app
IP_HASH_SALT=<random-string>
PORT=4000
```

Generate secrets with:

```bash
openssl rand -hex 32
```

## 3. Frontend Deployment (Vercel)

1. Import your repo on https://vercel.com
2. Set **Root Directory**: `apps/web`
3. **Framework Preset**: Next.js (auto-detected)
4. **Build Command**: `cd ../.. && pnpm install && pnpm build --filter @fx-library/web`
5. Set environment variables:

```
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/v1
```

### Important Notes

- Make sure `APP_ORIGIN` on the API matches the exact Vercel deployment URL
- The API must be deployed and accessible before the frontend can function
- CORS is strictly limited to `APP_ORIGIN` — update it if your domain changes
- Refresh tokens use httpOnly cookies with `sameSite: strict` — both services must share the same top-level domain for cookies to work in production, or adjust cookie settings accordingly

## 4. Post-Deployment Checklist

- [ ] Run database migrations
- [ ] Verify API health: `GET /v1/tags` should return tags
- [ ] Verify frontend loads and can reach API
- [ ] Create admin user (or use seed data)
- [ ] Test login/register flow
- [ ] Test asset upload via admin panel
- [ ] Test download flow with signed URLs
- [ ] Verify storage bucket permissions (previews public, assets private)
