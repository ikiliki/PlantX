# PlantX design: Sunny garden

The chosen redesign direction (`feature/redesign-garden`). Source: UI/UX Pro Max's "Plant Care Tracker" profile (Organic Biophilic + Soft UI, nature greens + earth brown + sunny yellow + water blue, warm humanist type) and its "Playful Creative" pairing.

## World

A sunny potting bench. Warm paper with morning light in one corner, chunky clay pieces you want to press, leaf green and terracotta with one bright sun-yellow accent. Friendly, tactile, a little bouncy, never childish.

## Two gardens

- **Sunny garden** (day) and **Night garden** (the same bench after dark: deep green-black #0F1A15, moonlit leaf green #B9E4A0 for actions and active text, firefly yellow #FFD873 as the accent, cards #17251E).
- Every colour, surface and shadow token is a CSS variable (`theme.colors.forest` is `var(--c-forest)`). `tokens.ts` holds the raw `day` / `night` palettes; `GlobalStyle` writes both. Translucent tints are `color-mix()` of a token, never a raw `rgba()` of a light colour.
- The device decides until the grower chooses; the choice is stored (`plantx.garden`) and painted before the app loads (`index.html`), and the browser chrome colour follows (`theme-color`). Logic: `src/theme/themeMode.ts`.
- `ThemeToggle` (top bar): sun and moon swap with a tumble; the new garden spreads out from the button in a circle (View Transitions), instant under reduced motion or without support.
- `colors.deep` / `onDeep` stay deep in both gardens (dock, level badge disc).

## Tokens (`src/theme/tokens.ts`)

- **Surfaces:** warm page (#FFF8EC) with a soft sun glow from the top start corner; white clay tiles; a leaf-green dock (`surface.dock*`).
- **Colour:** `forest` #1F5135 leaf green for actions and text, `growth` #FFC94A sunshine for active states and the growth action, `warmth` #F08A5D terracotta, `water` #3B8FD9.
- **Type:** Fredoka (display, 600; it carries Hebrew too) + Nunito (body). Bigger base size (15px) and display (clamp 34–52px).
- **Shape:** radii 12 / 18 / 26, pebble controls, control heights 38 / 48 (thumb-friendly).
- **Elevation:** clay. No borders on tiles; the moulded shadow is the edge. Buttons have a darker lower lip that flattens when pressed.

## Shell

- Slim top bar: wordmark and account only.
- The dock tucks below the edge while you scroll down a long page and comes back on any scroll up, near the top, or at the end (`useDockAway`). Between 900 and 1180px it shows icons only; the labels stay the accessible names. At night it carries a faint leaf edge.
- The main navigation is a floating leaf-green dock at the bottom centre on desktop (icons + labels, active item a sun-yellow pebble, menus open upward) and a floating rounded dock on the phone.

## Greenhouse

- Plant cards are clay tiles: an 8px lip around a rounded photo, Fredoka name in leaf green, fresh plants get a sun-yellow rim.
- The level card is a sunny plaque: yellow glow, a 30px Fredoka rank, white pebble counts, and a chunky inset XP bar whose stripes keep drifting while it grows.
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
- One elevation per surface: the clay shadow, no border on top of it.
