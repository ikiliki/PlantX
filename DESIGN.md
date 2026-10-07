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

## Greenhouse

- No card boxes: each plant is a journal plate, a 4:5 photograph with a Bodoni caption on the page. Hover draws a 1px underline under the name and slowly pushes into the photo.
- Status tags are square ink labels in tracked small capitals.
- The level card is a masthead between two ink rules: a large Bodoni rank, a 3px ink progress rule, counts underlined instead of chipped.
- Wide gutters (40px rows, 28px columns) so the shelf reads like a contact sheet.

## Motion

- One measured ease-in-out (`motion.ease`), slower durations (480ms): a page turning, never a bounce.
- Signature moment: shelf photographs print in turn, revealed top to bottom (`inkReveal`) while their captions fade up, 90ms apart.
- Controls press down 1px; no hover lifts. Everything stops under reduced motion.

## Labels

`theme.type.labelCase` / `labelTracking`: tracked small capitals (0.1em).
