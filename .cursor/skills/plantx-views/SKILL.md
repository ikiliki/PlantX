---
name: plantx-views
description: >-
  Reuse PlantX components in a page view and a widget view, and size them with
  the container so mobile, landing mocks, and embedded frames stay fluid and
  pixel perfect. Use when adding or changing UI, layouts, landing screens,
  widgets, responsive styles, or mobile behavior in this repo.
---

# PlantX views

## Reuse

- Put UI in `src/components`, `src/features/<feature>/components`, or `src/pages`.
- Each component has a sibling `*.styles.ts` (styled-components) and a story.
- A landing mock, rail, or card uses the same component as the route. Do not draw a second fake version of a table, deck, feed, or wiki.

## View

Shared type: `ComponentView` in `src/theme/view.ts` — `'page' | 'widget'`.

- `page` is the route. It can show the header, map, table of contents, and rails.
- `widget` is the same component in a smaller frame. Pass `view="widget"`. Show the same children, fewer rows, and drop chrome that only belongs on the route (page title block, map, toc).
- Default the prop to `'page'` so existing call sites stay full pages.
- The landing product section is feature copy plus an empty slot for a screenshot. Do not mount a live page there.

`GradeStack` uses `tab | page | widget`. The widget deck is `min(320px, 100%)` wide with a 3:4 ratio. Do not size a deck with `100svh` inside a card.

## Size

- Layout that can sit in a card follows the container. Put `container-type: inline-size` on the parent and use `@container` on the children. A container does not query itself.
- Widths use `min(…px, 100%)`, `minmax(0, 1fr)`, and `min-width: 0`. Text wraps. Do not clip a title with `overflow: hidden` on a scaled page.
- Do not `transform: scale()` a full page into a frame. The landing used to render a viewport-wide tree and scale it; that clipped type and made container queries read the wrong ancestor.
- Viewport `@media` is only for the app shell (top bar, bottom nav). Embedded components use `@container`.
- Listing rows: the table scroller is the container. At `max-width: 720px` the row keeps photo, name, grade, price, and change.
- Home columns follow `DiscoverPage` `Shell`. Below 900px the left rail hides; the feed keeps `MobileLure` (`GreenhouseLure compact` — photo stack / one `+`, sheet on tap) and `FeedFilterSlot`.
- Market list and map follow `MarketPage` `Board` at 960px. Greenhouse heading stacks under 720px of `Page`.
- `GreenhouseWallet` is a cream card. The plant count is always there. The market value shows only while the market wallet placement is on. On a wide greenhouse `Page` the card is a header companion with a soft growth wash and a split divider when both numbers show; under 720px it stays the compact full-width card. When that placement is held, blur only the money.
- Plant passport stacks with `@container` on `Frame` (not viewport media), so a narrow dialog stacks on a wide window. The photo is a sibling of the details and the activity. Under 760px those three stack in that order; the aside thumb hides; the AI badge is compact; the green wash runs top to bottom.
- Greenhouse `CollectionGrid` is 4 columns under 560px of `Page`, with `AddPlantCard` first and infinite scroll on the filtered list. No standalone Add button. No “Growing now” title — search and filters share one row, and under 720px of `Page` the search stays a short field. Right rail: Needs you today (short plant → action todos) above collapsible Activity, under the wallet column.

## Check

After a layout change, open the landing and the real route at a desktop width and a phone width. Confirm type is fully readable, Hebrew RTL still lines up, and landing frames stay inert.
