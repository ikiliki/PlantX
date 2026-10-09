# PlantX design: Sunny garden

The chosen redesign direction (`feature/redesign-garden`). Source: UI/UX Pro Max's "Plant Care Tracker" profile (Organic Biophilic + Soft UI, nature greens + earth brown + sunny yellow + water blue, warm humanist type) and its "Playful Creative" pairing.

## World

A sunny potting bench. Production's cream paper with a fresh lime glow in one corner, chunky clay pieces you want to press, a light leaf green with production's lime as the one bright accent. Friendly, tactile, a little bouncy, never childish.

## Two gardens

- **Sunny garden** (day) and **Night garden** (the same bench at dusk: a muted green-grey page #24332B, cards #2F4137, moonlit leaf green #C4EAAE for actions and active text, the same lime #CFEA78 as the accent; the dock and level badge stay deeper, #1A2B22).
- Every colour, surface and shadow token is a CSS variable (`theme.colors.forest` is `var(--c-forest)`). `tokens.ts` holds the raw `day` / `night` palettes; `GlobalStyle` writes both. Translucent tints are `color-mix()` of a token, never a raw `rgba()` of a light colour.
- The device decides until the grower chooses; the choice is stored (`plantx.garden`) and painted before the app loads (`index.html`), and the browser chrome colour follows (`theme-color`). Logic: `src/theme/themeMode.ts`.
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
- Phone: the nav is a floating rounded leaf-green dock that tucks below the edge while you scroll down and comes back on any scroll up, near the top, or at the end (`useDockAway`). At night it carries a faint leaf edge.

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
