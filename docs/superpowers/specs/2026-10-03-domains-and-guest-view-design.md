# Two domains, guest view, and real sessions

Branch: `feature/getting_ready`. Date: 2026-10-03.

## Goal

1. The marketing landing and the app each live on their own domain.
2. A signed-out visitor can try the app but sees no real data.
3. The server enforces what the guest view hides, and the session cannot be forged.

Success: a guest on the app domain sees every screen, can browse the catalog and try Add Plant, and hits a Log in message wherever personal or other growers' data would be. Calling the API directly as a guest returns 401 for that data. A hand-made `plantx_session` cookie does not sign anyone in.

## Part 1 — Two domains, one Vercel project

One codebase, one build, one deploy. Both domains point at the same Vercel project; behaviour switches on the host.

### Config

New env vars (documented in `.env.example`):

| Var | Used by | Example |
| --- | --- | --- |
| `VITE_APP_URL` | client | `https://app.example.com` |
| `VITE_LANDING_URL` | client | `https://example.com` |
| `PLANTX_APP_HOST` | `build-prod.mjs` | `app.example.com` |
| `PLANTX_LANDING_HOST` | `build-prod.mjs` | `example.com` |

When the host vars are unset (dev, QA, previews) there is no host split: everything behaves as today, with `/landing` reachable on the one host.

`src/lib/siteUrls.ts` exposes `appUrl(path)`, `landingUrl(path)` and `siteRole(): 'app' | 'landing' | 'both'` from `location.host` and the vars above.

### Routing

Server side (`build-prod.mjs` writes these into `.vercel/output/config.json` before the existing routes, only when both host vars are set):

- Landing host: `/api/*` → 404. Any path that is not a static file, `/` or `/landing` → 308 to the same path on the app host.
- App host: `/landing` and `/stills` → 308 to the landing host `/`.

Client side (`AppRoutes`): when `siteRole()` is `landing`, `/` renders `LandingPage` instead of redirecting to `/greenhouse`. The server rules are the backstop; the client rule is what makes the landing domain's root work.

### Landing changes

- `LandingHero` "Log in" and `LandingJoin` "Open app" become absolute links to `appUrl('/login')` and `appUrl('/greenhouse')`.
- `LandingJoin` today embeds the Google sign-in card. On the landing host it is replaced by a "Get started" button to `appUrl('/login')`. Signing in only ever happens on the app host, so Google needs one origin and the cookie stays on one host. When `siteRole()` is `both` the card stays as today.
- On the landing host the store does not call `/api` (no live boot, no slices). The landing only needs locale and static content.

### App changes

- The app's link to the landing uses `landingUrl('/')`.
- PWA: `vite.config.ts` sets `injectRegister: null`; `main.tsx` registers the service worker via `virtual:pwa-register` only when `siteRole()` is not `landing`. The landing domain never caches the app shell.
- CORS is unchanged: the app calls its own `/api` on the same origin.

### Manual steps (owner)

- Attach both domains to the Vercel project and set the four env vars for production.
- Add the app domain to Google's Authorized JavaScript origins.
- Everyone signs in once after the move (host-only cookie plus the new signed format, Part 3).

### Testing the host split

Vercel previews are `*.vercel.app`, so host rules don't fire there unless two preview aliases are assigned and the host vars point at them. Locally: unit-check the generated `config.json`, and run the client with `siteRole` forced via the vars against `localhost` and `127.0.0.1` as two hosts. The first full check is otherwise production right after the domains are attached.

## Part 2 — Guest view

### Surfaces

`src/theme/audience.ts`:

| Surface | Guest | Change |
| --- | --- | --- |
| `home` | `prompt` | was `browse` |
| `market` | `browse` | unchanged (coming soon, out of scope) |
| `greenhouse` (Mine) | `prompt` | was `browse` |
| `greenhouseGlobal` (new) | `prompt` | Global tab and `/greenhouse/:ownerId` |
| `rank` | `prompt` | unchanged |
| `wiki` (catalog) | `browse` | unchanged |
| `todo` | `prompt` | unchanged |
| `passport` | `prompt` | was `browse` — a passport is another grower's plant |
| `admin` | `hidden` | unchanged |

`prompt` here means: keep the page chrome (title, Mine | Global toggle, nav), replace the data area with `GuestView`.

### `GuestView`

Gains an optional secondary action: `secondary?: { label: string; onClick: () => void }`, rendered as a quieter button under Log in. Story updated with that variant.

### Per screen

- **Greenhouse, Mine:** heading and scope toggle stay. The level card and `CollectionBoard` are replaced by `GuestView` — "Log in to see your greenhouse" — with **Try adding a plant** opening `AddPlantDialog` (save and scan already open the sign-in popup). The `db.visitorId` empty-greenhouse path is removed.
- **Greenhouse, Global:** toggle stays; `GreenhouseDirectory` is replaced by `GuestView` — "Log in to see other growers' greenhouses".
- **`/greenhouse/:ownerId`:** `GuestView` with the same Global copy instead of the grower's name, level card and plants. No redirect, so a shared link explains itself.
- **Passport dialog:** `GuestView` inside the dialog.
- **Tasks:** `GuestView` — "Log in to see your tasks" — with **Try adding a plant**.
- **Home:** the feed column is replaced by `GuestView` — "Log in to see what's growing". `GreenhouseLure` and `WikiRail` (catalog) stay. `TopGreenhouses` and the todo rail are hidden. `MarketRail` and `RankRail` keep their current behaviour.
- **Catalog / wiki:** unchanged, fully open.

Guest screens do not request the gated slices (`users`, `plants`, `updates`, `todos`), so there are no 401 retries and no "unavailable" notice. `catalog` still loads.

### Strings

Every new title, body and button is added to both `en.json` and `he.json`. Hebrew layout is checked in RTL.

### Skill

`.cursor/skills/plantx-audience/SKILL.md`: update the surface rules, the Guest persona row, and the `GuestView` example (secondary action).

## Part 3 — Server authorization and sessions

### Gate guest-hidden routes

Add `requireUser` to:

- `GET /api/users/directory`, `/api/users/levels`, `/api/users/:id/level`
- `GET /api/activities`, `/api/activities/user/:userId`, `/api/activities/id/:id`, `/api/activities/:type/:userId`, `/api/activities/:type`
- `GET /api/plants`, `/api/plants/:id`, `/api/plants/:id/activities`

`GET /api/catalog` stays public. Before gating `GET /api/plants` and `/:id`, confirm nothing public (catalog counts, landing) reads them; if something does, it gets a narrow public endpoint returning only the counts it needs.

`GET /api/live` for a guest returns only what a guest screen needs (system and catalog); verify it returns no users' or plants' rows.

### Signed session cookie

- `server/src/lib/session.ts` uses Hono's `setSignedCookie` / `getSignedCookie` with `SESSION_SECRET`.
- `SESSION_SECRET` is required in QA and prod (`requiredEnv.ts`), added to `.env.example`.
- A cookie that fails verification is treated as signed out and cleared.
- Old unsigned cookies fail verification, so every user signs in once.

### Password-less sign-in

`POST /api/session` with `{ userId }` or `{ email }`:

- **prod:** rejected (404). Sign-out (`{ userId: null }`) keeps working.
- **qa:** kept, because local verification scripts sign in as `u-admin` this way. QA is a local Docker database.

Mock mode is browser-only and keeps persona switching.

Update `CLAUDE.md` "Known issues": remove the two fixed auth items, keep the Google tokeninfo fallback.

## Out of scope

- Market (coming soon).
- Google tokeninfo fallback to unverified claims (follow-up).
- Email/password login (see note below).
- A separate landing build or Vercel project (possible later without touching the app).

### Note: email/password login

Today sign-in is Google only. Adding passwords is its own feature: hashing (Node `scrypt`, no new dependency), a credentials table, sign-up, and — the expensive part — password reset, which needs an email provider. It also interacts with the pending-approval flow. Not in this spec; it can be brainstormed separately.

## Verification

- `npm run build` (type check).
- `node scripts/mobile-audit.mjs` on mock mode (5174), English and Hebrew, covering each guest screen.
- QA as a guest: every route shows its intended view with no console errors or retry loops; `curl` the gated endpoints without a cookie → 401; with a forged `plantx_session=u-admin` cookie → 401.
- QA signed in: greenhouse, global, tasks, home, passport, Add Plant unchanged.
- `build:prod` with host vars set: inspect the generated `config.json` routes.
