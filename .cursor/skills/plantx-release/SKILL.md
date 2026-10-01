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

**Pages** (`live` | `maintenance`):

- `maintenance` hides the page from nav. Direct visits show one shared maintenance notice (`PageGate`) — no feature UI peek underneath. Feature status is separate; page maintenance wins for the route.

**Features** (`features` on `SystemConfig`): `{ enabled, status }`. This is the only place a status is chosen.

- `enabled: false` — every component in that feature is disabled and not rendered. Their show switches are locked. The last status is kept.
- `enabled: true` — each component can still be hidden. Components that stay shown follow the feature status (`ready`, `comingSoon`, or `maintenance`).

**Components**, one `{ enabled }` per placement. The show switch works whenever the feature is on, except placements marked `required: true`. Those are the page itself (the market board, class, categories, category, greenhouse portfolio, news feed, greenhouse collection, rank, and wiki). They stay shown while the feature is on and have no hide switch. `placementRelease` is what gates read. Pieces in `PLAIN` have no flag: list them under their page with OK and no edit.

A placement is grouped in Admin under its page, and it follows `featureId`. Market coming soon shows the market page and the home market rail as the board with prices withheld, not a blur of live listings. It still forces the market board, the news market rail, the greenhouse portfolio, and the passport market together. The plant card follows the greenhouse, so turning the market off leaves the plants on the shelf. A listed plant only reads as on the market when the market itself is ready. The greenhouse portfolio still renders on the greenhouse page. The page status does not change its components.

```tsx
<PageGate pageId="market" title={t.nav.market}>
  <FeatureGate placement="market.board" title={t.nav.market}>
    <MarketBoard />
  </FeatureGate>
</PageGate>
```

News hosts market, rank, and wiki rails. Each rail has its own placement. Greenhouse being ready does not turn those rails on.

## Admin

`SystemPanel` on `/admin/system` edits pages, then features. There is no separate feature list. Headers follow the catalog section style. **Pages** and **Features** start open; individual page/feature rows and the kept/plain folders inside stay collapsed. An open page renders that page inside a max-height window that scrolls on its own. A feature header carries that feature’s enable switch and status, and its number is how many components can be hidden. Page rows, feature rows, and component rows use different indent and weight. Hideable components sit open under their page. Always shown and non controllable pieces each sit in a folder that starts collapsed. Under each component is the page and placement path it is mounted on. Optional rows are a show switch while the feature is on. Every component shows a disabled label with no edit when its feature is off.

## Landing

Frames mount the real page with `view="widget"`. Each page already wraps its feature UI in `FeatureGate`, so not-ready features show the blurred mock and banner — not an empty card.

## Reserved later

Market stage `pendingListings` stays reserved until that release needs it.

## Check

Changing a page status updates that page and its nav link. Changing a feature status updates every shown component in that feature, wherever it is mounted. Hiding a component applies while its feature is on. Turning the feature off disables every component and locks the switches. No route that is open should render only a blank notice. A tab or title that opens market content stays hidden unless that market piece is ready. The market nav link stays hidden when the market feature itself is off.
