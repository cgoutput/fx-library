# Project Check Report

Date: 2026-02-17

## Commands run

- `pnpm lint`
- `pnpm build`

## Results

### Lint

`pnpm lint` completed successfully. There are multiple warnings (primarily `prettier/prettier` formatting issues and `@typescript-eslint/no-explicit-any` warnings) in `apps/api` and `apps/web`, but no blocking lint errors.

### Build

`pnpm build` failed.

Main failures:

1. **TypeScript/Prisma API type mismatches in API service code**
   - `Prisma.AssetWhereInput` is not exported in current generated Prisma client usage in `apps/api/src/assets/assets.service.ts`.
   - `Prisma.AssetOrderByWithRelationInput` is not exported in current generated Prisma client usage in `apps/api/src/assets/assets.service.ts`.
   - `EventType` and `Prisma.InputJsonValue` import/type issues in `apps/api/src/events/events.service.ts`.

2. **Implicit `any` TypeScript errors (API)**
   - Several callback parameters need explicit typing in:
     - `apps/api/src/assets/assets.service.ts`
     - `apps/api/src/collections/collections.service.ts`

3. **Web build environment/network issue**
   - `apps/web` build retried and failed fetching Google Fonts (`fonts.googleapis.com`) during Next.js build.

## Suggested next steps

1. Regenerate and verify Prisma client/schema alignment for API (`prisma generate`, check schema model/type names).
2. Remove or replace direct Prisma namespace type references that are unavailable in generated client.
3. Add explicit callback parameter types in API services where `noImplicitAny` is enforced.
4. For deterministic CI builds, switch to local/self-hosted fonts or ensure outbound access to Google Fonts.
