---
name: plantx-components
description: >-
  Place PlantX UI in the right folder with a sibling styles file and story.
  Use when adding or refactoring a component, page, form control, or admin panel.
---

# PlantX components

## Where

| Kind | Path |
| --- | --- |
| Shared UI | `src/components/<Name>/` |
| Feature UI | `src/features/<feature>/components/<Name>/` |
| Page shell | `src/pages/<Name>Page/` |
| Browser utility | `src/lib/` (no styles/story) |

## Each component

- `<Name>.tsx` — the component
- `<Name>.styles.ts` — styled-components next to it
- `<Name>.stories.tsx` — at least one story

Pages compose features. They do not own repeated form controls.

## Extract when

A pattern appears twice or more (same Field + Select + "Choose", same admin header + tabs). Pull it into a named component with styles and a story.

## Examples

- `AdminPage` — admin check, header, lead, tabs
- `CatalogSelect` — labeled catalog select with choose option
- `PhotoIdentify` — up to 3 photos, each scanned separately; renders `AiScan` (scan, typed answer, provider chain) for the selected photo and a strip of slots with stickers
- `PhotoCheckSticker` — tilted "test passed" stamp with one photo's AI result (`sm` on thumbs, `md` on big photos)
- `PhotoChecks` — a plant's photos with numbered thumbs and stickers (review, passport activity, admin preview)
- `AddPlantWizard` — stepped flow built on `Stepper` + `ChoiceChips` (`src/components`); AI picks use `suggestedId`
- `IdentifyBadge` — AI verified / edited / manual mark for a plant (card, passport, review)
- `ApisPanel` — presentational; page loads data
- `AdminSection` — admin card with heading, lead, side note
- `Segmented` (`src/components`) — button switch for modes and filters; tabs reuse its styles
- `Switch` (`src/components`) — on/off `role="switch"` with busy spinner; System and APIs admin toggles
- `LoaderShell` — table placeholder while a live slice or admin list is still loading. Server tables use `useServerSlices`; APIs uses it for providers and history. Mock mode skips it.
