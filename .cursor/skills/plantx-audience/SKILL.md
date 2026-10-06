---
name: plantx-audience
description: >-
  Require a signed-out guest view and a persona-aligned mock world for PlantX
  screens. Use when adding or changing a page, feature component, route, empty
  state, demo persona, greenhouse, market mock, or anything a visitor sees
  before they log in.
---

# PlantX audience

Every surface declares what a signed-out visitor gets. Personas own their mock slices. Do not invent a second world inside a component.

## Guest view

`AppSurface` and `SURFACE_GUEST` live in `src/theme/audience.ts`.

- Adding a route or a primary screen means adding an `AppSurface` and a `GuestAccess` (`browse`, `prompt`, or `hidden`). `SURFACE_GUEST` is a `Record`, so a missing entry fails typecheck.
- Render both branches with `forAudience`. The `guest` branch is required. Do not reuse the signed-in empty state as the guest view.
- `browse`: the public screen. Only the catalog (`wiki`) and the coming-soon market.
- `prompt`: the real page with placeholders instead of data, blurred, and a floating log-in card (`GuestView card`), except Greenhouse Mine, where the Add tile is the call to action, and Home, which explains PlantX instead (below). Never a bare message on an empty page. Home, greenhouse (Mine), `greenhouseGlobal` (Global tab and `/greenhouse/:ownerId`), tasks, rank. The passport is the exception: a small log-in popup.
- `hidden`: not available until signed in (admin).
- Placeholders are the feature's own skeleton, never fetched: `FeedUpdateSkeleton`, `GreenhousePlantCardSkeleton`, `GreenhouseLevelSkeleton`, `GreenhouseDirectorySkeleton` (each with a story). `GuestCurtain` blurs them under the card. The same skeletons, unblurred and without a card, are a member's loading state; do not add a spinner for those screens. Until `/api/live` answers, the app shows its full-page loader (`ProductShell`), so no page renders a guest view before the session is known; the greenhouse member loading state keeps the Add tile disabled until the plants arrive.
- Home: `GuestHomeIntro`, not a blurred feed — a short explainer (Snap a photo → AI suggests what it is → Know what’s due) on a looping example photo, labelled Example, that auto-advances (tap a step to hold it; Pause/Play; still under reduced motion). One primary action, Try adding a plant (`/greenhouse?add=1`), plus Log in, and a line that saving needs an account. `GreenhouseLure` and the catalog rail stay; `TopGreenhouses` goes. Greenhouse (Mine): the real level card with an empty greenhouse (level 1, 0 plants; `GreenhouseLevelView`), the real Add tile (“Try adding a plant”), blurred placeholder cards only from 560px up (a phone shows just the tile), with no log-in card: log in stays in the top bar and in Add Plant (`CollectionBoard` `skeleton="guest"`, no `rail`). Global keeps its card. Tasks: the real calendar with no tasks, blurred, card with Try adding a plant. On Tasks, Try adding a plant (guest card or the empty-greenhouse hero) goes to `/greenhouse?add=1`, which opens Add Plant there and drops the flag.
- Add Plant stays open to guests. Its AI button reads Log in to use AI (enabled from the start, opens the sign-in popup, never calls identify). Save reads Save on this device: the plant goes to `localStorage` (`src/features/greenhouse/guestPlants.ts`, up to `GUEST_PLANT_LIMIT`) with only what they filled in — no place, no AI result, no tasks or XP — and the done screen offers Log in to keep it. Greenhouse Mine shows those plants (non-navigating `preview` cards) instead of the placeholders, with a Saved on this device only note. On the next sign-in the store sends each one with `POST /api/plants` (the account's greenhouse place) and drops it from the browser once the server saved it; a pending sign-up keeps them until the account is approved and signs in.
- With Google sign-in off (server says disabled), `AuthPanel` says Sign-ups are paused with Continue as a guest (`onGuest`), not an error. A GIS script that fails to load is still an error. Embedded in a page with its own h1 (landing), pass `headingLevel="h2"`.
- Guest copy lives in the `guest` i18n section. Every string in `en.json` and `he.json`.
- Legal (`legal: browse`): `/privacy` and `/terms` (`LegalPage`) sit outside the product shell like the landing, so they open while the app is closed or the API is down. Every sign-in agrees first: `AuthPanel` keeps Google locked until the Terms box is ticked and sends `LEGAL_VERSION`; the server refuses a sign-up without it. A member on an older version gets the blocking `ConsentDialog`. Bump `LEGAL_VERSION` (`src/features/legal/legalVersion.ts`) only when the text changes in substance.
- Other members never get the account name (#95): the server sends the nickname or `anonymousGrowerName` ("Grower 4F2A") in `name`; only the grower and the admin see the real one.

```tsx
const body = forAudience(signedIn, {
  guest: (
    <GuestCurtain card={<GuestView card title={t.guest.homeTitle} body={t.guest.homeBody} action={t.guest.logIn} />}>
      {SKELETON_FEED_KINDS.map((kind, i) => <FeedUpdateSkeleton key={i} kind={kind} />)}
    </GuestCurtain>
  ),
  signedIn: loading ? <GuestCurtain>{skeletons}</GuestCurtain> : <Feed />,
})
```

## Server

Hiding is enforced on the server, not just in the UI. Members-only routes use the `signedIn` middleware (`server/src/lib/session.ts`; handlers read `c.get('user')`): whole routers with `.use('*', signedIn)` (plants, activities), single routes otherwise (users directory and levels). Only the catalog and `/api/live` (counts, no rows) are public. On the client, `useServerSlices` only asks for `guestCanLoad` slices while signed out, so guest screens never hit a 401. The session cookie is signed (`SESSION_SECRET`).

## Personas

Five greenhouse accounts, plus admin. Guest is signed out (`currentUserId` null), not a greenhouse.

| Persona | Id | World |
| --- | --- | --- |
| Guest | signed out | Every screen shows its real layout, blurred placeholders and a log-in card; nothing member-only is fetched. The catalog is open, and Add Plant can be tried (scan and save ask them to sign in). |
| New grower | `u-ari` | Empty account. No plants, nothing in the market. |
| Unverified | `u-noa` | Owns plants. `publishRequirement` is `verified`, so listing is blocked. |
| Rich | `u-maya`, `u-daniel`, `u-gal` | Their own plants and the full market. |
| Admin | `u-dana` | Same rich world, plus configuration. |

`personaFlags` in `src/mock/personas.ts` is applied by `loginAs`. Plants stay with their owner. Do not reassign another greenhouse's plants onto the viewer.
