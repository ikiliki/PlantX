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
- `browse`: the public screen. No personal greenhouse, sell, grade, or admin action.
- `prompt`: replace the screen with `GuestView` and a sign-in action.
- `hidden`: not available until signed in (admin).

```tsx
const body = forAudience(signedIn, {
  guest: <GuestView title={t.greenhouse.guestTitle} body={t.greenhouse.guestBody} action={t.profile.lockedAction} />,
  signedIn: <CollectionBoard {...board} />,
})
```

## Personas

Five greenhouse accounts, plus admin. Guest is signed out (`currentUserId` null), not a greenhouse.

| Persona | Id | World |
| --- | --- | --- |
| Guest | signed out | Browse market, news, and the catalog. Greenhouse and rank prompt sign-in. |
| New grower | `u-ari` | Empty account. No plants, nothing in the market. |
| Unverified | `u-noa` | Owns plants. `publishRequirement` is `verified`, so listing is blocked. |
| Rich | `u-maya`, `u-daniel`, `u-gal` | Their own plants and the full market. |
| Admin | `u-dana` | Same rich world, plus configuration. |

`personaFlags` in `src/mock/personas.ts` is applied by `loginAs`. Plants stay with their owner. Do not reassign another greenhouse's plants onto the viewer.
