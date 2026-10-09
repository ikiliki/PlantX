# Screens Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Desktop daily Home, 🌿 reactions and comments on the Feed, clean greenhouse cards with owner-made shelves, a catalog photo grid sorted by rarity, and a passport with Timeline · Details tabs.

**Architecture:** Two new server features (`feed-social`, `shelves`) on new Postgres tables, each with a store namespace in `server/src/db/store.ts`, a pg driver file, a Hono routes + service pair, and a matching mock-mode path in `src/mock/store.tsx`. Everything else is client UI in existing components.

**Tech Stack:** Vite + React 19 + TS, styled-components, Hono, `pg`, Playwright e2e.

**Spec:** `docs/superpowers/specs/2026-10-10-screens-redesign-design.md`

## Global Constraints

- Component folder = `<Name>.tsx` + `<Name>.styles.ts` + `<Name>.stories.tsx`; shared UI in `src/components/`, feature UI in `src/features/<f>/components/`.
- Every route handles guests; gate with `PageGate` / `FeatureGate`; never a blank page.
- `en.json` and `he.json` stay in sync; check Hebrew RTL; container queries, no `transform: scale()` on a page.
- No backward compatibility: change the schema directly, no guards for a missing migration.
- Verification is `npm run build` only locally; e2e ship in the same commit as the code they cover; guest read-only tests tagged `@prod`; tests never leave rows (answer write routes with `page.route`).
- Comment body 1–500 characters; shelf name 1–40 characters; one 🌿 reaction per person per activity.
- Push with `git -c http.sslBackend=schannel`.

## Review Focus

- A comment of only spaces → rejected (400) and the Send button stays disabled; trimmed length is what counts. (Task 1, Task 2)
- Reacting twice quickly (double tap) → ends in one reaction, count never goes negative or double. (Task 1 `PUT`/`DELETE` are idempotent; Task 2 test)
- Moving a plant to a shelf owned by someone else → 403, placement unchanged. (Task 3)
- Deleting a shelf with plants on it → plants show under "Not on a shelf", nothing else lost. (Task 3, Task 4)
- A plant whose owner changes → its old shelf placement disappears. (Task 3 driver test via SQL in the plant save path)

---

### Task 1: Server — reactions and comments

**Files:**
- Create: `supabase/migrations/20261010100000_activity_social.sql` (tables exactly as in spec §2)
- Create: `server/src/db/drivers/supabaseActivitySocial.ts`
- Modify: `server/src/db/store.ts` (new `activitySocial` namespace), `server/src/db/drivers/supabase.ts` (wire it)
- Create: `server/src/features/feed-social/feedSocial.routes.ts`, `feedSocial.service.ts`
- Modify: `server/src/app.ts` (mount), `server/src/features/activity/activity.routes.ts` (decorate lists)
- Modify: `src/mock/types.ts` (`FeedUpdate` gains optional counts; new `ActivityComment`)

**Interfaces:**
- Produces (types, `src/mock/types.ts`):
  - `FeedUpdate` + `reactions?: number; reacted?: boolean; comments?: number`
  - `ActivityComment = { id: string; activityId: string; userId: string; body: string; createdAt: string }`
- Produces (store): `activitySocial.counts(activityIds: string[], viewerId: string): Promise<Map<string, { reactions: number; reacted: boolean; comments: number }>>`, `react(activityId, userId)`, `unreact(activityId, userId)`, `comments(activityId): Promise<ActivityComment[]>` (not deleted, oldest first), `addComment(input: { activityId; userId; body }): Promise<ActivityComment>`, `getComment(id)`, `softDeleteComment(id)`.
- Produces (HTTP, signed in): `PUT /api/activities/:id/reaction` → `{ reactions, reacted: true }`; `DELETE /api/activities/:id/reaction` → `{ reactions, reacted: false }`; `GET /api/activities/:id/comments` → `{ comments }`; `POST /api/activities/:id/comments` `{ body }` → `{ comment }`; `DELETE /api/comments/:id` → `{ ok: true }`. Every activity in every activities list response carries `reactions`, `reacted`, `comments`.

- [ ] **Step 1:** Write the migration (spec §2 SQL verbatim; `body` check uses `char_length(btrim(body)) between 1 and 500`).
- [ ] **Step 2:** Implement the driver and store namespace. `react` is `insert … on conflict do nothing`; `unreact` is a plain delete, so both are idempotent.
- [ ] **Step 3:** Implement `feedSocialService`: every action first loads the activity and runs `visibleTo([activity], user)`; empty → `Errors.missing`. `addComment` trims, rejects empty or > 500 with `Errors.invalid`, and uses the existing rate-limit helper (same one the identify/issue routes use) with key `comment:<userId>`, 10 per minute. `deleteComment` allows the comment author, the activity's owner, or `role === 'admin'`, else `Errors.forbidden`.
- [ ] **Step 4:** In `activity.routes.ts`, wrap each `visibleTo(...)` result with `withSocial(rows, user)` (in the service) that merges `counts`.
- [ ] **Step 5:** `npm run build` → passes (tsc for server).
- [ ] **Step 6:** Commit `Feed social: reactions and comments tables, store, routes`.

### Task 2: Client — 🌿 and comments on posts

**Files:**
- Modify: `src/mock/liveApi.ts` — `putReaction(id)`, `deleteReaction(id)`, `fetchComments(id)`, `postComment(id, body)`, `deleteComment(id)` (same `request` helper as `postTodoComplete`)
- Modify: `src/mock/store.tsx` — `react(activityId: string, on: boolean): void` (optimistic count/reacted on `db.updates`, then API); mock mode keeps `db.activityComments: ActivityComment[]` and `db.activityReactions: { activityId; userId }[]` in `MockDb` and seeds none
- Create: `src/features/feed/components/ReactBar/` (🌿 toggle with count + 💬 count button)
- Create: `src/features/feed/components/CommentThread/` (list + composer; author name via `publicGrowerName`; delete link per rules) and `useComments(activityId)` in `src/features/feed/useComments.ts` returning `{ comments, loading, add(body): Promise<boolean>, remove(id): Promise<boolean> }`
- Modify: `FeedPost.tsx` (ReactBar under the caption; phone opens CommentThread in a sheet using `useDialogLayer` + `SheetGrip` like `ActivityBell`; ≥900px renders it inline under the post), `FeedUpdate.tsx` (counts only, read-only)
- Modify: `src/i18n/en.json`, `he.json` — `feedPage.react`, `feedPage.reacted`, `feedPage.comments` ("{n} comments"), `feedPage.commentOne`, `feedPage.commentPlaceholder` ("Say something nice"), `feedPage.send`, `feedPage.deleteComment`, `feedPage.noComments` ("No comments yet. Be the first.")
- Test: `e2e/feed-social.spec.ts`

- [ ] **Step 1: Write the failing test** — signed in as `MEMBER`; `page.route('**/api/activities', …)` adds activity `e2e-social` (kind `added`, `reactions: 2, reacted: false, comments: 1`); routes answer `PUT/DELETE **/reaction` and `GET/POST **/comments` and `DELETE /api/comments/*` from an in-test array.
  - `🌿 2` button → click → shows `3` and `aria-pressed="true"`; double click again quickly → ends at `3`/`2` consistently (count equals 2 + pressed?1:0).
  - Open comments → shows the seeded comment; Send is disabled for `"   "`; type `"Lovely"` → Send → comment appears and count reads `2 comments`.
  - Delete own comment → it disappears.
- [ ] **Step 2:** Run `npm run build` (tests run in CI only) → build fails until components exist.
- [ ] **Step 3:** Implement the files above. Send is enabled only when `body.trim().length` is 1–500.
- [ ] **Step 4:** `npm run build` → passes.
- [ ] **Step 5:** Commit with the spec file `Feed: 🌿 reactions and comments on posts`.

### Task 3: Server — shelves

**Files:**
- Create: `supabase/migrations/20261010110000_shelves.sql` (spec §3 SQL verbatim)
- Create: `server/src/db/drivers/supabaseShelves.ts`; modify `store.ts`, `supabase.ts`
- Modify: `server/src/db/drivers/supabase.ts` plant save path: after the plants upsert, run
  `delete from shelf_plants sp using shelves s, plants p where sp.shelf_id = s.id and p.id = sp.plant_id and s.owner_id <> p.owner_id`
- Create: `server/src/features/shelves/shelves.routes.ts`, `shelves.service.ts`; mount `/api/shelves` in `app.ts`; add `PUT /api/plants/:id/shelf` in `greenhouse.routes.ts` calling the shelves service
- Modify: `src/mock/types.ts`

**Interfaces:**
- Produces (types): `Shelf = { id: string; ownerId: string; name: string; position: number }`, `ShelfPlacement = { plantId: string; shelfId: string; position: number }`
- Produces (HTTP, owner only): `GET /api/shelves` → `{ shelves, placements }` (mine); `POST /api/shelves` `{ name }` → `{ shelf }` (position = last + 1); `PATCH /api/shelves/:id` `{ name?, position? }` → `{ shelves }` (position moves it and renumbers the rest 0..n-1); `DELETE /api/shelves/:id` → `{ ok }` (placements cascade); `PUT /api/plants/:id/shelf` `{ shelfId: string | null }` → `{ placement | null }`.
- Rules: shelf name trimmed 1–40 else 400; a plant and shelf must both belong to the caller else 403; max 30 shelves per owner else 400.

- [ ] **Step 1:** Migration, driver, store namespace (`list(ownerId)`, `placements(ownerId)`, `add`, `update`, `remove`, `place(plantId, shelfId | null)`).
- [ ] **Step 2:** Service + routes with the rules above.
- [ ] **Step 3:** The owner-change cleanup statement in the plant save path.
- [ ] **Step 4:** `npm run build` → passes. Commit `Shelves: tables, store, routes; owner change drops the placement`.

### Task 4: Client — Grid / Shelves view

**Files:**
- Modify: `src/mock/liveApi.ts` (`fetchShelves`, `postShelf`, `patchShelf`, `deleteShelf`, `putPlantShelf`), `src/mock/store.tsx` (`db.shelves`, `db.shelfPlacements` in `MockDb`; actions `addShelf(name): Promise<boolean>`, `renameShelf(id, name)`, `moveShelf(id, position)`, `removeShelf(id)`, `placePlant(plantId, shelfId | null)`; mock seed gives `u-maya` two shelves "Balcony", "Living room" with 2 plants each)
- Create: `src/features/greenhouse/components/ShelfRow/` (shelf name + sideways row of plant cards + "⋯" menu: Rename, Move up, Move down, Delete), `ShelfBoard/` (rows in order + "Not on a shelf" row + "Add shelf" inline input), `useShelfView()` in `src/features/greenhouse/useShelfView.ts` (`'grid' | 'shelves'`, localStorage key `plantx.greenhouse.view`, try/catch)
- Modify: `GreenhousePage.tsx` / `CollectionBoard.tsx` — a `Segmented` Grid / Shelves next to the filters on your own greenhouse only; filters apply to both views; cards in shelves get a "Move to…" menu item listing shelves + "Not on a shelf"
- i18n: `greenhouse.viewGrid`, `viewShelves`, `shelfAdd` ("Add shelf"), `shelfNamePlaceholder` ("Balcony, Living room…"), `shelfRename`, `shelfUp`, `shelfDown`, `shelfDelete`, `shelfDeleteConfirm` ("Delete {name}? Its plants stay in your greenhouse."), `shelfNone` ("Not on a shelf"), `moveTo` ("Move to…"), `shelfEmpty` ("No plants here yet")
- Test: `e2e/shelves.spec.ts` (MEMBER; `page.route` answers `/api/shelves*` and `/api/plants/*/shelf` from in-test state): switch to Shelves → Add shelf "Balcony" → row appears; delete it → its plants show under "Not on a shelf"; reload keeps Shelves view; a public greenhouse (`/greenhouse/u-admin`) shows no switch.

- [ ] Steps: test → build fails → implement → build passes → commit `Greenhouse: Grid / Shelves view with owner shelves`.

### Task 5: Client — clean plant cards

**Files:**
- Modify: `src/features/greenhouse/components/GreenhousePlantCard/GreenhousePlantCard.tsx` + styles + story
- Test: extend `e2e/home-redesign.spec.ts` → rename nothing; add test in `e2e/shelves.spec.ts` "plant cards have one status line and no badges on the photo"

Rules: remove `StatusMark` overlays, `IdentifyBadge` on the card, and the `$living` dashed border. Add `CardStatus` under the name: a 8px dot + text from the existing `statusFor` (`warm` tone → `theme.colors.warn` dot and text, else muted text with moss dot). Keep the lock icon for private plants and the care action buttons.

- [ ] Test asserts `[data-plant-card] [data-card-status]` count equals card count and `[data-plant-card] [data-identify-badge]` count is 0 → implement → build → commit `Greenhouse cards: clean photo, one status line`.

### Task 6: Client — passport Timeline · Details

**Files:**
- Modify: `src/features/greenhouse/components/PlantPassport/PlantPassport.tsx` (+ styles, story)
- Create: `src/features/greenhouse/components/PassportTimeline/` (check-in photos and activity rows merged newest first on one dated line), `PassportDetails/` (lineage, market class code, care (light / water from catalog), AI or Manual identification with `IdentifyBadge`, and for the owner a `Shelf` select using `placePlant`)
- i18n: `passport.timelineTab` ("Timeline"), `passport.detailsTab` ("Details"), `passport.shelfLabel` ("Shelf")

Tab order: Timeline (default, replaces Activity) · Details · Grading (if rank on) · Tasks (if todo on) · Market (if market on) · Settings (owner). Header above tabs: photo, name, species, grade, owner (as today).

- [ ] Test in `e2e/plant-privacy.spec.ts` style (MEMBER, existing plant route mocks): passport opens on `Timeline` tab selected; `Details` shows "Shelf" select for the owner; `Settings` still has Public / Private → implement → build → commit `Passport: Timeline and Details tabs`.

### Task 7: Client — catalog photo grid

**Files:**
- Modify: `src/features/species/components/WikiIndex/WikiIndex.tsx` (+ styles, story) for the full page view (widget view unchanged)
- Create: `src/features/species/components/CatalogTile/` (photo, name, three icons: light (`light`), water (`drop`), rarity (`RarityChip` small)); tap opens `CatalogPreview`
- i18n: `guide.search` ("Search plants"), `guide.allRarities` ("All")

Rules: search matches common name (both languages) and scientific name; rarity `FilterChips` All + each rarity with counts; sort by rarity order of the catalog's rarity list (common first), then `speciesName` with `localeCompare`; grid 2 columns under 560px container, up to 5 at ≥1100px. Suggest a plant row and Your suggestions stay above the grid. Remove the contents table and collapsed rarity groups.

- [ ] `@prod` guest test in `e2e/catalog-grid.spec.ts`: `/wiki` shows tiles; the first tile's rarity is the first rarity in the chip row order; typing a name from the first tile filters to tiles containing it; choosing a rarity chip shows only that rarity → implement → build → commit `Catalog: photo grid with care and rarity icons, sorted by rarity`.

### Task 8: Client — desktop daily Home

**Files:**
- Modify: `src/pages/DiscoverPage/DiscoverPage.tsx` (+ styles): signed-in members always render `HomeToday`; delete the three-column member branch and now-unused imports/styles
- Modify: `src/features/discover/components/HomeToday/HomeToday.styles.ts`: `@container (min-width: 900px)` two columns — start: hello, care, greenhouse; end: market, rank, feed preview

- [ ] Change `e2e/home-redesign.spec.ts` "phone Home…" test to run on both projects ("Home opens with a greeting…"); delete `e2e/feed-refresh.spec.ts` (the desktop feed tools move to `/feed`; add its freshness assertion to the Feed test in `home-redesign.spec.ts` on desktop) → implement → build → commit `Home: daily view on desktop too`.

### Task 9: Docs, skills, push, PR

- [ ] Update `.cursor/skills/plantx-views/SKILL.md` (Home, Feed social, greenhouse cards/shelves, catalog grid, passport tabs) and `plantx-components/SKILL.md` (new components).
- [ ] `npm run build` → passes; push with schannel.
- [ ] Ask the user before applying both migrations to PlantX-PP (shared PP database). After approval, apply them in order and confirm the tables exist.
- [ ] Open PR into master ("Refs" the screens issue if one exists), body states **Migration: yes** with both files, PP applied, prod right before merge; bind via `ccd_pr`; give the PP link.

---

## Self-review notes

- Spec §1 → Task 8; §2 → Tasks 1–2; §3 → Tasks 3–5 (+ shelf select in Task 6); §4 → Task 7; §5 → Task 6; Testing/Migrations → Task 9.
- Passport: the spec lists Timeline · Details · Settings; the existing Grading / Tasks / Market tabs are kept between Details and Settings so nothing is lost (Activity becomes Timeline).
