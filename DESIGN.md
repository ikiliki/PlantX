# PlantX design: Botanical (refined)

Direction A of three redesign candidates (`feature/redesign-botanical`, `feature/redesign-garden`, `feature/redesign-modern`). The product is an Operate-mode app: growers manage plants, browse the market and rank. Scanability and consistency outrank expression; the brand lives in the details.

## World

The current PlantX identity, sharpened. Forest green, cream paper and a lime growth accent. Plants and photos carry the colour; the chrome stays quiet.

## Tokens (`src/theme/tokens.ts`)

- **Surfaces:** flat cream page (`surface.page`), warm white cards (`creamCard`), warm white top bar. No decorative gradient blobs.
- **Colour:** `forest` for primary actions and active text, `growth` (lime) only for active states and the growth action, `muted` #56655D (5.5:1 on cream, AA for small text).
- **Type:** Fraunces (display, weight 500, -0.02em) + Inter (body). Hebrew falls back to Frank Ruhl Libre and Rubik. Sizes come from `theme.text` (xs 12 → display clamp 32–46px).
- **Shape:** radii 8 / 12 / 16, pill controls (`radii.control`), control heights 36 / 44 (`theme.control`).
- **Elevation:** declared once. Cards rest on a 1px border; shadows are for menus, dialogs and lifted (hovered) cards.

## Shell

- Desktop: a full-height **greenhouse rail** on the start edge (`layout.sideNav`): wordmark on top, the nav as an icon list (active row tinted `barActive`), submenus opening beside their row, the account at the foot. Sticky page offsets read `layout.chromeTop` (0 beside the rail).
- Phone: the slim top bar (wordmark, bell, account) stays.
- Phone bottom nav: icon pill on the active tab.

## Rules

- New UI reads tokens; no raw hex in `*.styles.ts`.
- Headings use `fonts.displayWeight` / `fonts.displayTracking`, never a hard-coded weight.
- One elevation per surface: border or shadow.

## Greenhouse

- Plant cards are framed specimens: 6px mount around an inset photo (radius `md`), Fraunces name below. Hover lifts the card and slowly zooms the photo; press settles it (scale 0.985).
- Status tags sit on the photo as frosted sentence-case pills, not uppercase stamps.
- The level card is a flat sheet (border only, no gradient blob); its XP bar grows in from the start edge on arrival.
- Care section headings are Fraunces, not uppercase micro-labels.

## Motion

- Ease-out-quint (`motion.ease`) everywhere: things settle like a leaf landing, no bounce.
- Signature moment: shelf cards sprout up from their bottom edge, staggered 55ms.
- Controls lift 1px on hover and press in 60ms. Everything stops under reduced motion.

## Labels

`theme.type.labelCase` / `labelTracking`: micro-labels speak in sentence case.

## Pages

- Wiki cards are framed specimens like the greenhouse cards (inset 4:3 photo, lift and slow zoom).
- Market rows tint leaf-green on hover instead of jumping; prices are Fraunces with tabular figures.
- Feed cards rest on a border and lift with a shadow only on hover.
- Empty states are composed: an icon mark, the title in Fraunces, a hint, an optional next step.
