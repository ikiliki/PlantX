# PlantX design: Modern

Direction C of three redesign candidates (`feature/redesign-botanical`, `feature/redesign-editorial`, `feature/redesign-modern`). The app is Operate-mode and the market is a live exchange of plant classes; this direction leans into that: a confident app with a trading-floor edge.

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

## Rules

- New UI reads tokens; no raw hex in `*.styles.ts`.
- Anything placed in the chrome uses `surface.bar*` tokens, never `colors.forest` (it disappears on the dark bar).
- Headings use `fonts.displayWeight` / `fonts.displayTracking`.
