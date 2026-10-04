# CLAUDE.md

## Project

PlantX is a bilingual (English + Hebrew) marketplace for living plants.

- Growers keep plants in a **greenhouse**; each plant has a **passport** (photo, identity, grade, owner, lineage, history).
- The **market** lists standardized classes (code like `POT-GOLD-A-M-R`: species-variety-grade-size-stage).
- **Rank** is a community swipe deck (S/A/B/C, separate from catalog grade A/B/C). **Wiki** holds care info per species.
- One admin-edited **catalog** feeds admin, market filters and Add Plant.
- Prices in ₪. Buying records intent only — no payment processing.
- Product spec (local, gitignored): `base44/PLANTX.md`.

## Stack

- Client: Vite + React 19 + TypeScript, React Router 7, styled-components, PWA (`vite-plugin-pwa`), Leaflet.
- API: Hono in `server/src/` — `app.ts` (routes), `index.ts` (local node server), `vercel.ts` (Vercel function).
- DB: Postgres via `pg` (`server/src/db/drivers/supabase.ts`), schema in `supabase/migrations/`.
- No Tailwind, no component library. Do not add libraries without a clear need.

## Run modes

| Mode | Command | Web | API | Data |
| --- | --- | --- | --- | --- |
| mock | `npm run dev` | 5174 | none | browser localStorage (`src/mock/seed.ts`) |
| qa | `npm run qa:up` then `npm run dev:qa` | 5173 | 8787 | Docker Supabase (Studio 54323) |
| prod | `npm run dev:prod` | 5175 | 8789 | hosted Supabase (`PROD_DATABASE_URL`) |

- `npm run qa:reset` reapplies migrations. `npm run seed:fixtures` regenerates `server/fixtures/demo` from `src/mock`.
- Deploy: `npm run build:prod` builds the client and bundles the API into Vercel Build Output (`/api/*` → function). With `VITE_LANDING_URL` / `VITE_APP_URL` set it also adds the two-domain host redirects (`src/lib/siteUrls.ts` is the client side). Production needs `SESSION_SECRET` (signed session cookie).
- Env: see `.env.example`. Never commit `.env` / `.env.local`.

## Key files

- `src/App.tsx` — provider stack (Theme → Store → I18n → Router → Auth → Sell).
- `src/app/AppRoutes/AppRoutes.tsx` — all routes; `/plants/:id` and `/sellers/:id` open as dialogs.
- `src/mock/store.tsx` — the app state layer in **every** mode (despite the folder name). `src/mock/liveApi.ts` talks to `/api` in qa/prod.
- `src/mock/types.ts` — shared domain types, also imported by the server.
- `src/i18n/` — `t`, `tr(en, he)`, `dir`, `formatMoney`; `en.json` and `he.json` must stay in sync. QA and production are English-only for now (`locales.ts`); mock mode keeps Hebrew so it stays maintained.
- `src/theme/release.ts` — `PageGate` / `FeatureGate`; `audience.ts` guest rules; `plantxEnv.ts` mode detection.
- `server/src/features/<feature>/` — `*.routes.ts` + `*.service.ts` per feature (session, users, catalog, identify, plants, todos, ...).
- `server/src/features/identify/identify.service.ts` — the only orchestrator of the identify chain (Gemini plant check → Pl@ntNet → Gemini draft).

## Rules

Project conventions live in `.cursor/skills/`. Before UI or feature work, read `.cursor/skills/plantx-skills/SKILL.md`, then only the skills that match the task (components, audience, release, views, identify). When a task changes a pattern, update the skill (see plantx-skill-keeper) instead of duplicating it here.

Hard rules:
- Component folder = `<Name>.tsx` + `<Name>.styles.ts` + `<Name>.stories.tsx`. Shared UI in `src/components/`, feature UI in `src/features/<f>/components/`, pages in `src/pages/<Name>Page/`.
- Every route handles guests (`SURFACE_GUEST`: browse / prompt / hidden).
- Gate with `PageGate` / `FeatureGate`; never render a blank page.
- Layout: container queries, `min()` / `minmax(0, 1fr)`; never `transform: scale()` on a page. Check Hebrew RTL.
- Never send API keys or provider names to the browser. Never run live identify in automated checks.
- Keep business logic in services/feature logic, not in page components.

## Verification

- No unit tests and no linter. `npm run build` (tsc + vite) is the type check — `tsconfig.json` covers `src/` only, so server code is not checked on its own.
- UI regression: `npm run e2e` — tests for a fix ship in the same commit as the fix; tag guest, read-only tests `@prod`.
  Run (Playwright, `e2e/`) against `PLANTX_E2E_URL` (default local QA on 5173; start it first). Desktop and phone. Tests answer `/api/identify` themselves and block creating plants, so they never call a provider or leave rows. On PP set `PLANTX_TEST_TOKEN`.
- CI: `.github/workflows/pp-regression.yml` runs it after each Vercel deploy of the PP head, and only the `@prod` tests (guest, read-only; production has no test login) after each production deploy, and comments results with screenshots on the "PP regression" issue (images on `qa-assets`, videos in the run artifact). `issue-status.yml` moves `status:` labels when a PR that says "Refs #n" merges into pp or master.
- PRs into pp: `pr-e2e.yml` runs the same suite against a QA stack built on the runner (Docker Supabase, `dev:qa`, demo catalog via `scripts/e2e-seed.mjs`) and comments screenshots on the PR. Its `e2e` check is required by branch protection before merging into pp.
- Visual checks: `node scripts/mobile-audit.mjs` against mock mode on 5174, in English and Hebrew.
- `scripts/tmp-*` and `scripts/_*` are throwaway verification output — don't commit them.

## Known issues (follow-ups)

- **Auth:** `POST /api/session` with `{ userId }` or `{ email }` still signs in without a password on QA (local Docker; verification scripts use it). Production rejects it (`server/src/features/session/session.routes.ts`).
- **Auth:** Google token check falls back to unverified claims when tokeninfo is unreachable (`server/src/lib/googleAuth.ts`).
- `.env.example` still mentions Plant.id / `KINDWISE_API_KEY` (removed). `scripts/smoke.mjs` visits routes that no longer exist.
- Legacy JSON dirs (`data/`, `server/data*`) and root `mock/catalog.json` are unused. `esbuild` is used by `build-prod.mjs` but not declared.
