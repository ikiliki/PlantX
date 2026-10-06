# PlantX design: Editorial

Direction B of three redesign candidates (`feature/redesign-botanical`, `feature/redesign-editorial`, `feature/redesign-modern`). The app is Operate-mode, but PlantX sells living things whose photos do the persuading; this direction treats every page like a page of a plant journal.

## World

A field journal on warm paper. Near-black green ink, hairline rules, square-cut controls, a high-contrast Bodoni for headings. Colour is rationed: a sage marker highlight for active states, and the plant photos.

## Tokens (`src/theme/tokens.ts`)

- **Surfaces:** one paper (#F7F4EC) from masthead to footer; cards a lighter sheet (`creamCard`) on a hairline. An ink rule (`surface.barBorder`) separates the top bar and phone nav from the page.
- **Colour:** `forest` is ink (#1C2721): primary buttons, active text. `growth` is sage (#D7E2B0), never neon. `muted` #59615B (AA on paper).
- **Type:** Libre Bodoni (display, weight 500, -0.015em) + Public Sans (body). Hebrew falls back to Frank Ruhl Libre and Rubik. Big display size (clamp 36–60px); nav set in small tracked capitals.
- **Shape:** radii 3 / 4 / 6, square-cut controls (`radii.control` 3px). Pills only for avatars and small status chips.
- **Elevation:** almost none. Cards rest on hairlines; shadows only for menus, dialogs and a hovered card.

## Shell

- Masthead: Bodoni wordmark, small-caps nav with a 1px ink underline on the active item, ink rule underneath.
- Phone bottom nav on the same paper, ink rule above.

## Rules

- New UI reads tokens; no raw hex in `*.styles.ts`.
- Headings use `fonts.displayWeight` / `fonts.displayTracking`.
- No new colours: emphasis comes from size, weight and the rule, not tint.
