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
- `AddPlantWizard` — stepped flow on `Stepper` + `ChoiceChips`, inside a fixed smaller `AddPlantDialog` (the step body scrolls, the footer stays). The first step is Add photo, and a photo is required. Fill in manually and a bluish Continue with AI sit together; both enable once a photo is added. AI runs only from that button, then a plant answer fills the other steps and slides to review. Category and subcategory are text chips: four at a time, Other stays on the row, then Show more. The subcategory row is always there and gray with no options until a category is chosen. Specs fields stay on the page and stay gray with no options until the previous choice unlocks them. A chosen class shows a small white catalog mark. On review the plant photo stays large and the catalog photo is a small mark. Location is not a step: the plant copies the greenhouse place from Settings (`GreenhousePlace`), Unknown until the owner changes it. The catalog area trait is not required and is not saved.
- `GreenhousePlace` — owner location select on Settings. Default Unknown when the region is empty or already unknown.
- `IdentifyBadge` — AI verified / edited / manual mark for a plant (card, passport, review)
- `ApisPanel` — presentational; page loads providers and suggestions. Tabs are the pipeline stages (plant check, species, catalog fields). Each stage is Ready or Mock on its own, and a Mock change stays on that stage. The status badge follows that stage's response when the API is up. A failed save is shown on the stage. The catalog-fields mock uses the same chips as Add Plant: category, subcategory, size, stage, and that category's traits. `IdentifyPlayground` uses the same stage controls for a pipeline run.
- `AdminSection` — admin card with heading, lead, side note
- `Pager` (`src/components`) — previous / next with `PAGE_SIZE` (10). `AdminTable` and the market use `usePaged`. A single page hides the control. `anchor: 'end'` opens a timeline on the latest page.
- `InfiniteScroll` (`src/components`) — same page size, loaded when the edge scrolls into view. News grows downward. Greenhouse activity opens on the latest rows and loads older rows when its thread scrolls up.
- `Switch` (`src/components`) — on/off `role="switch"` with busy spinner; System and APIs admin toggles
- `SuggestionEditorDialog` — catalog suggestion form for category, subcategory, properties, and both photos. Requests opens it from an open category row.
- `RequestsPanel` — Admin → Requests. Applications are one Server-style table, suggested categories are another. Open rows sit with added and declined rows. Each table selects, expands, and pages by 10.
- `LoaderShell` — table placeholder while a live slice or admin list is still loading. Pass `busy` while a slice is in flight after the API is already up. `compact` is the rail/widget size (no skeleton rows). Server sections and System page/feature rows use `useSectionFetch`: opening one shows the loader and that header stays open until the response. A failed slice shows unavailable and can close. APIs uses the loader for providers and history. Greenhouse page wraps `CollectionBoard` in `LoaderShell`; `GreenhouseLure` uses the compact shell. Mock mode skips it.
- `FloatChip` — mobile-only fixed chip (draggable, tap opens sheet). Home uses `HomeMobileFloats` for greenhouse + Needs today.
