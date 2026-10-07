# PlantX design: Modern

Direction C of three redesign candidates (`feature/redesign-botanical`, `feature/redesign-garden`, `feature/redesign-modern`). The app is Operate-mode and the market is a live exchange of plant classes; this direction leans into that: a confident app with a trading-floor edge.

## World

A night greenhouse. Dark chrome (top bar, phone nav) frames a cool, light working page with crisp white cards. One loud colour, an electric lime, marks what is active and the growth action. Geometric grotesk headings.

## Tokens (`src/theme/tokens.ts`)

- **Surfaces:** chrome #0C1712 (`surface.bar`, `surface.nav`) with light ink (`barInk`) and a lime-tinted active state (`barActive`); page #F2F4F0; cards pure white on a 1px border.
- **Colour:** `forest` #0F2A1E for primary buttons and active text on light; `growth` #B8F04A for the login action, active icons and focus; `muted` #515E57 (AA on the page).
- **Type:** Space Grotesk (display, weight 600, -0.03em) + DM Sans (body). Hebrew falls back to Rubik for both.
- **Shape:** radii 8 / 12 / 18, soft-square controls (`radii.control` 12px), control heights 36 / 44.
- **Elevation:** cards rest on a border; crisp, short shadows for menus, dialogs and hovered cards.

## Shell

- Dark top bar: wordmark, soft-square nav items with a lime-tinted active state, lime Log in.
- Dark phone bottom nav: active icon in lime on a tinted square.
- `theme-color` matches the chrome so the phone status bar blends in.
- **Quick jump (⌘K / Ctrl K):** a search field in the top bar (icon only on the phone) opens `CommandPalette`: every page and every catalog plant, filtered as you type, arrow keys to move, Enter to open, Escape to close (focus returns to the trigger). It lives in the chrome's night colour.

## Rules

- New UI reads tokens; no raw hex in `*.styles.ts`.
- Anything placed in the chrome uses `surface.bar*` tokens, never `colors.forest` (it disappears on the dark bar).
- Headings use `fonts.displayWeight` / `fonts.displayTracking`.

## Greenhouse

- Plant tiles: full-bleed photo with a night scrim under the identity chips, Space Grotesk name. Hover tips the tile toward you (perspective lift and rotateX 3deg), rings it in lime and pushes the photo in; press snaps it back (scale 0.98).
- Status chips are dark glass (blur + saturate, 1px light edge); the tone lives in the text colour (lime = fresh, warm = needs care).
- The level card is the greenhouse dashboard: the chrome's night colour, a lime glow in the corner, a 30px rank, tabular counts, and an XP bar that charges in and then breathes with a soft lime glow.
- Care section labels carry a small glowing lime pip.

## Motion

- Expo-out (`motion.ease`), short durations (120 / 200 / 320ms): quick to answer, long soft landing.
- Signature moment: everything that arrives pops in from a blur (`riseIn`: blur 6px, scale 0.97); shelf tiles 35ms apart.
- Controls press hard (scale 0.95, 60ms). Everything stops under reduced motion.

## Labels

`theme.type.labelCase` / `labelTracking`: tight capitals (0.04em).

## Pages

- Wiki cards tip and ring in lime like the greenhouse tiles.
- Market listings are data rows, not cards: hairlines between rows, tabular figures, a lime-tinted selection, Space Grotesk prices.
- Feed cards rest on a border and ring in lime on hover.
- Empty states carry a glowing night tile as their mark.
