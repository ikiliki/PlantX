# PlantX design: Botanical (refined)

Direction A of three redesign candidates (`feature/redesign-botanical`, `feature/redesign-editorial`, `feature/redesign-modern`). The product is an Operate-mode app: growers manage plants, browse the market and rank. Scanability and consistency outrank expression; the brand lives in the details.

## World

The current PlantX identity, sharpened. Forest green, cream paper and a lime growth accent. Plants and photos carry the colour; the chrome stays quiet.

## Tokens (`src/theme/tokens.ts`)

- **Surfaces:** flat cream page (`surface.page`), warm white cards (`creamCard`), warm white top bar. No decorative gradient blobs.
- **Colour:** `forest` for primary actions and active text, `growth` (lime) only for active states and the growth action, `muted` #56655D (5.5:1 on cream, AA for small text).
- **Type:** Fraunces (display, weight 500, -0.02em) + Inter (body). Hebrew falls back to Frank Ruhl Libre and Rubik. Sizes come from `theme.text` (xs 12 → display clamp 32–46px).
- **Shape:** radii 8 / 12 / 16, pill controls (`radii.control`), control heights 36 / 44 (`theme.control`).
- **Elevation:** declared once. Cards rest on a 1px border; shadows are for menus, dialogs and lifted (hovered) cards.

## Shell

- Top bar: brand, nav items as pills (active pill tinted `barActive`), account.
- Phone bottom nav: icon pill on the active tab.

## Rules

- New UI reads tokens; no raw hex in `*.styles.ts`.
- Headings use `fonts.displayWeight` / `fonts.displayTracking`, never a hard-coded weight.
- One elevation per surface: border or shadow.
