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

- `AdminPage` — admin check, tabs
- `CatalogSelect` — labeled catalog select with choose option
- `PhotoIdentify` — `max` photos (default `MAX_PLANT_PHOTOS`, 3), each scanned separately; Add Plant passes `ADD_PLANT_UPLOAD_LIMIT` (1). Renders `AiScan` for the selected photo. A single photo has the remove control on that scan and no thumbnail or hint under it. More than one photo keeps the strip of slots with stickers. Stories keep the multi-photo frames.
- `PhotoCheckSticker` — tilted "test passed" stamp with one photo's AI result (`sm` on thumbs, `md` on big photos)
- `PhotoChecks` — a plant's photos with numbered thumbs and stickers (review, passport activity, admin preview)
- `AddPlantWizard` — stepped flow on `Stepper` + `ChoiceChips`. The first step is Add photo, and a photo is required. Fill in manually and a bluish Continue with AI sit together; both enable once a photo is added. AI runs only from that button, then a plant answer fills the other steps and slides to review. Category and subcategory are text chips, and Other is a choice on both. The photo sits under those chips. On review the plant photo stays large and the catalog photo is a small mark.
- `IdentifyBadge` — AI verified / edited / manual mark for a plant (card, passport, review)
- `ApisPanel` — presentational; page loads providers and suggestions. One tab per provider: Loading until that status arrives, then Loaded. Enabled switch, then Ready or Mock response. Mock match sets category, a subcategory switch, properties, and more properties. Mock not-in-catalog picks a suggestion.
- `AdminSection` — admin card with heading, lead, side note
- `Pager` (`src/components`) — previous / next with `PAGE_SIZE` (10). `AdminTable` and the market use `usePaged`. A single page hides the control. `anchor: 'end'` opens a timeline on the latest page.
- `InfiniteScroll` (`src/components`) — same page size, loaded when the edge scrolls into view. News grows downward. Greenhouse activity opens on the latest rows and loads older rows when its thread scrolls up.
- `Switch` (`src/components`) — on/off `role="switch"` with busy spinner; System and APIs admin toggles
- `SuggestionEditorDialog` — catalog suggestion form for category, subcategory, properties, and both photos. Requests opens it from an open category row.
- `RequestsPanel` — Admin → Requests. Applications are one Server-style table, suggested categories are another. Open rows sit with added and declined rows. Each table selects, expands, and pages by 10.
- `LoaderShell` — table placeholder while a live slice or admin list is still loading. Pass `busy` while a slice is in flight after the API is already up. Server sections and System page/feature rows use `useSectionFetch`: opening one shows the loader and that header stays open until the response. A failed slice shows unavailable and can close. APIs uses the loader for providers and history. Mock mode skips it.
- `FloatChip` — mobile-only fixed chip (draggable, tap opens sheet). Home uses `HomeMobileFloats` for greenhouse + Needs today.
