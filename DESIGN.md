# PlantX design: Sunny garden

The chosen redesign direction (`feature/redesign-garden`). Source: UI/UX Pro Max's "Plant Care Tracker" profile (Organic Biophilic + Soft UI, nature greens + earth brown + sunny yellow + water blue, warm humanist type) and its "Playful Creative" pairing.

## World

A sunny potting bench. Production's cream paper with a fresh lime glow in one corner, chunky clay pieces you want to press, a light leaf green with production's lime as the one bright accent. Friendly, tactile, a little bouncy, never childish.

## Two gardens

- **Sunny garden** (day) and **Night garden** (the same bench at dusk: a muted green-grey page #24332B, cards #2F4137, moonlit leaf green #C4EAAE for actions and active text, the same lime #CFEA78 as the accent; the dock and level badge stay deeper, #1A2B22).
- Every colour, surface and shadow token is a CSS variable (`theme.colors.forest` is `var(--c-forest)`). `tokens.ts` holds the raw `day` / `night` palettes; `GlobalStyle` writes both. Translucent tints are `color-mix()` of a token, never a raw `rgba()` of a light colour.
- The sunny garden is the default (the device's dark setting does not switch it); the night garden only when the grower picks it. The choice is stored (`plantx.garden`) and painted before the app loads (`index.html`), and the browser chrome colour follows (`theme-color`). Logic: `src/theme/themeMode.ts`.
- `ThemeToggle` (top bar): sun and moon swap with a tumble; the new garden spreads out from the button in a circle (View Transitions), instant under reduced motion or without support.
- `colors.deep` / `onDeep` stay deep in both gardens (dock, level badge disc).

## Tokens (`src/theme/tokens.ts`)

- **Surfaces:** cream page (#F4F1E8, as in production) with a soft lime glow from the top start corner; white clay tiles; a leaf-green dock (`surface.dock*`).
- **Colour:** `forest` #1F5135 leaf green for actions and text, `growth` #CFEA78 lime (production's accent) for active states and the growth action, `warmth` #F2C8A7 soft peach, `water` #3B8FD9.
- **Type:** Fredoka (display, 600; it carries Hebrew too) + Nunito (body). Bigger base size (15px) and display (clamp 34–52px).
- **Shape:** radii 12 / 18 / 26, pebble controls, control heights 38 / 48 (thumb-friendly).
- **Elevation:** clay. No borders on tiles; the moulded shadow is the edge. Buttons have a darker lower lip that flattens when pressed.

## Shell

- Desktop top bar: wordmark, the nav as a tray of pebbles with icons (active page a lime pebble, menus open downward; icons only between 900 and 1180px), the garden toggle and the account.
- Phone: the nav is a floating rounded dock in the same colours as the desktop tray (light surface, muted labels, a lime pebble with dark text for the active tab). It tucks below the edge while you scroll down and stays tucked at the end of the page; it comes back on any scroll up or near the top (`src/app/dockState.ts`). While it is tucked, Back to top takes its place at the bottom centre; tapping it scrolls up, brings the dock back and leaves. At night it carries a faint leaf edge.

## Greenhouse

- Plant cards are clay tiles: an 8px lip around a rounded photo, Fredoka name in leaf green, fresh plants get a lime rim.
- The level card reads level → progress → where the XP came from: the ring and rank on the start, the XP bar in the middle with a ledger under it (plants added and care done, each with its icon, then "60 XP to level 3" and the rules), the owner's tiles at the end. The ring fills slowly from empty (1.8s, a registered `--progress`), the bar grows in at the same pace, and a soft band of light crosses the bar every 8 seconds.
- Care section headings are Fredoka.

## Motion

- Back-out easing (`motion.ease`): everything overshoots a touch and settles, like a bouncy seedling.
- Signature moment: tiles hop when you reach for them (lift + 1° tilt with overshoot), and press down into the bench (scale 0.97, 80ms).
- Arrivals pop in from 0.94 scale; the XP stripes drift. Everything stops under reduced motion.

## Labels

`theme.type.labelCase` / `labelTracking`: plain sentence case.

## Rules

- New UI reads tokens; no raw hex in `*.styles.ts`.
- Anything in the dock uses `surface.dock*`.
- Text or icons on the lime accent (or on peach `warmth`) use `colors.onGrowth`, which stays dark in both gardens. Never `forest` or `ink` there: at night they turn light.
- One elevation per surface: the clay shadow, no border on top of it.

## Home feed

- Above the feed (desktop): a status line with a small live dot ("Updated 3 min ago") and a labelled Refresh pill. After a refresh it says "You're up to date" with a lime dot for a few seconds. Coming back to a tab that has been away over 2 minutes refreshes by itself (`useFeedRefresh`). Phones keep pull to refresh.

## Pull to refresh (phone)

- Home refreshes from its feed (`useFeedRefresh`). Market, Greenhouse, Tasks and Catalog get the same pull from the shell (`usePageRefresh`, page map in `src/app/pageRefresh.ts`): an open page refetches only its own slices; a page still coming soon or under maintenance reloads everything, system config included, so a launch shows on the next pull. A guest refetches only what a guest may load. Add a page to the map when it shows server data.

## Landing

- Same world as the app: the garden glow behind the page, Fredoka headings, clay actions with the moulded lip, the garden toggle in the nav, the nav links as a pebble tray.
- One heading voice for every section (`src/features/landing/landingType.ts`): big balanced Fredoka titles, a readable lead. Section labels ("AI identify", "Take the tour") stay for screen readers only; the heading carries the section.
- Hero: a large title, the primary action as a chunky leaf-green button with an up-right arrow, a light secondary, who it is for as a quiet line with a lime dot under the actions, the product floating slowly over a lime glow.
- Benefits show on phones too, as clay tiles with a lime icon each. The tour sits on a full-bleed soft-green band; coming-soon cards stay dashed (a preview, not a door); the join box is a lifted clay card.
- Sections rise in as they scroll into view (scroll-driven animation where supported, shown plainly elsewhere and under reduced motion).

## Greenhouses: mine and everyone's

- `GreenhouseTabs` (My greenhouse | All greenhouses) leads the greenhouse page on every screen size, as plain links with `aria-current`; on a phone it sticks under the top bar. It replaces the floating Mine/Global toggle, which people missed.
- All greenhouses: a title, a one-line invitation and "N growers · M plants"; a large search field; sort pebbles (Top level by default, Most plants, Recently active) and a Near me filter when the viewer has a region; a titled Verified section; a grid of greenhouse cards. Sorting and filtering live in `greenhouseDirectory.ts`.
- Greenhouse card (full size): a clay card with a mosaic of up to three plants (one tall, two stacked), the level ring in a cream collar on its lower edge, then name, rank, place and plant count, and two lines of bio. Compact (the Home rail) keeps the single row.
- A grower's page: an inline "All greenhouses" back link (no floating arrow), the level card, then "On the shelf · N" with clay plant cards.
