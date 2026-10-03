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
- `prompt`: the real page with placeholders instead of data, blurred, and a floating log-in card (`GuestView card`). Never a bare message on an empty page. Home, greenhouse (Mine), `greenhouseGlobal` (Global tab and `/greenhouse/:ownerId`), tasks, rank. The passport is the exception: a small log-in popup.
- `hidden`: not available until signed in (admin).
- Placeholders are the feature's own skeleton, never fetched: `FeedUpdateSkeleton`, `GreenhousePlantCardSkeleton`, `GreenhouseLevelSkeleton`, `GreenhouseDirectorySkeleton` (each with a story). `GuestCurtain` blurs them under the card. The same skeletons, unblurred and without a card, are a member's loading state; do not add a spinner for those screens.
- Home: blurred skeleton feed under the card; `GreenhouseLure` and the catalog rail stay; `TopGreenhouses` goes. Greenhouse: blurred level card and shelf, the real Add tile (“Try adding a plant”), and the card in place of the activity rail (`CollectionBoard` `skeleton` + `rail`; on a phone the card sits under the Add tile). Tasks: the real calendar with no tasks, blurred, card with Try adding a plant.
- Add Plant stays open to guests. Scan and save open the sign-in popup and do not call the server.
- Guest copy lives in the `guest` i18n section. Every string in `en.json` and `he.json`.

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
