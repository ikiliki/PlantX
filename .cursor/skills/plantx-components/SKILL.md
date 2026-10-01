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
- `PhotoIdentify` — `max` photos (default `MAX_PLANT_PHOTOS`, 3), each scanned separately; Add Plant passes `ADD_PLANT_UPLOAD_LIMIT` (1). Renders `AiScan` for the selected photo. A single photo has the remove control on that scan and no thumbnail or hint under it. More than one photo keeps the strip of slots with stickers. Stories keep the multi-photo frames.
- `PhotoCheckSticker` — tilted "test passed" stamp with one photo's AI result (`sm` on thumbs, `md` on big photos)
- `PhotoChecks` — a plant's photos with numbered thumbs and stickers (review, passport activity, admin preview)
- `AddPlantWizard` — stepped flow built on `Stepper` + `ChoiceChips` (`src/components`); AI picks use `suggestedId`
- `IdentifyBadge` — AI verified / edited / manual mark for a plant (card, passport, review)
- `ApisPanel` — presentational; page loads data
- `AdminSection` — admin card with heading, lead, side note
- `Pager` (`src/components`) — previous / next with `PAGE_SIZE` (10). `AdminTable` and the market use `usePaged`. A single page hides the control. `anchor: 'end'` opens a timeline on the latest page.
- `InfiniteScroll` (`src/components`) — same page size, loaded when the edge scrolls into view. News grows downward. Greenhouse activity opens on the latest rows and loads older rows when its thread scrolls up.
- `Switch` (`src/components`) — on/off `role="switch"` with busy spinner; System and APIs admin toggles
- `SuggestionEditorDialog` — catalog suggestion form for category, subcategory, properties, and both photos. The list story stays on `CatalogSuggestions`.
- `LoaderShell` — table placeholder while a live slice or admin list is still loading. Pass `busy` while a slice is in flight after the API is already up. Server sections and System page/feature rows use `useSectionFetch`: opening one shows the loader and that header stays open until the response. A failed slice shows unavailable and can close. APIs uses the loader for providers and history. Mock mode skips it.
