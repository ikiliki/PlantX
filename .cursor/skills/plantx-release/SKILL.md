---
name: plantx-release
description: >-
  Gate PlantX features and pages from Admin System config. Use when adding or
  changing a feature, its public entries, a landing widget, a nav item, a tab
  that embeds another feature, or admin system controls.
---

# PlantX release

Release status is editable config in Admin → System (`db.system`). It is not a TypeScript interface of required faces.

A page is a container of features. Pages never show an empty screen. Gate features, not by wiping the page.

## Config

Types and defaults live in `src/theme/release.ts`. Values persist on `MockDb.system`.

`/admin` never shows the maintenance hold. There is no separate admin sign-in: a signed-out visit goes to `/login?next=/admin/...`, a signed-in non-operator goes to `/home`, and the operator (the bootstrap Gmail, the only admin) gets the admin shell. `/login` is the hold — back to landing, no product header — and stays open when the API is down. `?mode=signup` opens it on Sign up; `next` returns only to same-site paths.

Sign-in is Google only (mock mode uses a stand-in button that signs in the operator). Log in and sign up are one flow: a Google email with no account files a pending application and the card shows "Thanks for signing up" (server error `pending`); a repeat sign-in reuses the open application; a rejected application or disabled account gets `declined`. Admin approves in Requests, then the next Google sign-in opens the account. Do not call it early access or request access anywhere. When the API is down, failed lists say unavailable and the status line shows why (HTTP status and the server message). Demo rows are not substituted. Empty environment names are listed on the signed-in admin server status only; the values are never shown, and the sign-in card does not list them.

`launched: false` shows the not-launched hold. The operator and members with `preapproved` still enter. Approving an application marks that account pre-approved. Admin can clear the mark on the member.

**Pages** (`live` | `maintenance`):

- `maintenance` hides the page from nav. Direct visits show one shared maintenance notice (`PageGate`) — no feature UI peek underneath. Feature status is separate; page maintenance wins for the route.

**Features** (`features` on `SystemConfig`): `{ enabled, status }`. This is the only place a status is chosen.

- `enabled: false` — every component in that feature is disabled and not rendered. Their show switches are locked. The last status is kept.
- `enabled: true` — each component can still be hidden. Components that stay shown follow the feature status (`ready`, `comingSoon`, or `maintenance`).

A feature can own a route with a page row. Tasks (`todo`) has `PAGE_IDS` entry `todo`, required placement `todo.board`, and widget placement `home.todo`. Greenhouse care uses the todo feature flag for Needs/Upcoming filters and `TodoCareDialog` (no `greenhouse.todo` widget). Admin System lists Tasks under Pages and under Features.

**Components**, one `{ enabled }` per placement. The show switch works whenever the feature is on, except placements marked `required: true`. Those are the page itself (the market board, class, categories, category, greenhouse portfolio, news feed, greenhouse collection, rank, wiki, and todo widgets). They stay shown while the feature is on and have no hide switch. `placementRelease` is what gates read. Pieces in `PLAIN` have no flag: list them under their page with OK and no edit.

A placement is grouped in Admin under its page, and it follows `featureId`. Market coming soon shows the market page and the home market rail as the board with prices withheld, not a blur of live listings. It still forces the market board, the news market rail, the greenhouse portfolio, and the passport market together. The plant card follows the greenhouse, so turning the market off leaves the plants on the shelf. A listed plant only reads as on the market when the market itself is ready. Greenhouse Growing Now **Listed** and **Sold** filters follow the same gate (`isPlacementReady(..., 'market.board')`) and stay off the shelf while the market is not ready. The greenhouse wallet (`greenhouse.market.wallet`) renders only while the market feature is on; when held, blur only the money. Profile market stats and trust (`profile.market.stats`, `profile.market.trust`) are required market placements: always on when the market feature is ready, no hide switch. They stay off the profile while the market is not ready. Passport To Do (`passport.todo`) follows the care feature: planned and history care rows for that plant. The page status does not change its components.

```tsx
<PageGate pageId="market" title={t.nav.market}>
  <FeatureGate placement="market.board" title={t.nav.market}>
    <MarketBoard />
  </FeatureGate>
</PageGate>
```

Home hosts market, rank, and wiki rails. Each rail has its own placement. Greenhouse being ready does not turn those rails on.

## Admin

`SystemPanel` on `/admin/system` edits pages, then features. There is no separate feature list. Headers follow the catalog section style. **App** starts open. **Pages**, **Features**, and the redirect preview start collapsed; individual page/feature rows and the kept/plain folders inside stay collapsed. Opening a page or feature row shows the loader and that row stays open until its data arrives. Home previews start on the first page of the feed. An open page renders that page inside a max-height window that scrolls on its own. A feature header carries that feature’s enable switch and status, and its number is how many components can be hidden. Page rows, feature rows, and component rows use different indent and weight. Hideable components sit open under their page. Always shown and non controllable pieces each sit in a folder that starts collapsed. Under each component is the page and placement path it is mounted on. Optional rows are a show switch while the feature is on. Every component shows a disabled label with no edit when its feature is off.

## Landing

The landing uses stills of the real app, not mounted pages (see plantx-views). Only features that are ready get a section or a tour tab.

## Reserved later

Market stage `pendingListings` stays reserved until that release needs it.

## Check

Changing a page status updates that page and its nav link. Changing a feature status updates every shown component in that feature, wherever it is mounted. Hiding a component applies while its feature is on. Turning the feature off disables every component and locks the switches. No route that is open should render only a blank notice. A tab or title that opens market content stays hidden unless that market piece is ready. The market nav link stays hidden when the market feature itself is off.
