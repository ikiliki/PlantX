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
- `AddPlantWizard` — stepped flow on `Stepper` + `ChoiceChips`, inside a fixed smaller `AddPlantDialog` (the step body scrolls, the footer stays). The first step is Add photo, and a photo is required. Fill in manually and a bluish Continue with AI sit together; both enable once a photo is added. AI runs only from that button, then a plant answer fills the other steps and slides to review. The AI answer (name, confidence) stays on that review step; going back to the photo shows the photo only. Category and subcategory chips show a small catalog photo and the name. On a phone (≤640px, `useMediaQuery`) a tap selects, and the “pick the category” lead stays. Wider, that lead and the footer hint are hidden; hover shows a small clickable note (scientific name and light); clicking that note opens `CatalogPreview` with the rest of the catalog card (a variety leads with its own photo and code) and no Choose button. Clicking the chip only selects it. Other selects directly, with no popup. No chosen-class card sits between the rows. Four show at a time, Other stays on the row, then Show more. With no category yet, the subcategory row says to choose a category first. The subcategory row is always there and gray with no options until a category is chosen. Specs fields stay on the page and stay gray with no options until the previous choice unlocks them. A chosen class shows a small white catalog mark. On review the plant photo stays large, the catalog photo is a small mark, and the `IdentifyBadge` sits on the photo. The dialog has no title or intro. The photo step has no heading; the clear-photo line sits under the photo at every width, including under 420px. The stepper names the step and shows every step name at every width. Under 420px of the dialog the other step headings and info banners hide; a warning banner with Use AI's answer stays. An AI answer with no catalog category, saved as Other, stays AI verified (badge: Not in catalog). Location is not a step: the plant copies the greenhouse place from Settings (`GreenhousePlace`), Unknown until the owner changes it. The catalog area trait is not required and is not saved. A signed-out guest can open the form and fill it in. Continue with AI and Save open `AuthDialog` (portaled above this dialog) and do not call identify or create a plant.
- `GreenhousePlace` — owner location select on Settings. Default Unknown when the region is empty or already unknown.
- `IdentifyBadge` — AI verified / edited / manual mark for a plant (card, review, passport activity). The passport identity head does not show it; the stamp on the photo stays.
- `ApisPanel` — presentational; page loads providers and suggestions. Tabs are the pipeline stages (plant check, species, catalog fields). Each stage is Ready or Mock on its own, and a Mock change stays on that stage. The status badge follows that stage's response when the API is up. A failed save is shown on the stage. The catalog-fields mock uses the same chips as Add Plant: category, subcategory, size, stage, and that category's traits. `IdentifyPlayground` uses the same stage controls for a pipeline run.
- `AdminSection` — admin card with heading, lead, side note
- `Pager` (`src/components`) — previous / next with `PAGE_SIZE` (10). `AdminTable` and the market use `usePaged`. A single page hides the control. `anchor: 'end'` opens a timeline on the latest page.
- `InfiniteScroll` (`src/components`) — same page size, loaded when the edge scrolls into view. News grows downward. Greenhouse activity opens on the latest rows and loads older rows when its thread scrolls up.
- `FilterChips` (`src/components`) — filter chips with an optional icon and count. Greenhouse filters and the Home feed (wider than 900px) use it. Under 560px of the page they use the Tasks phone pill (13px, neutral fill, forest when selected) and wrap; between that and 720px they stay one scrolling row.
- `IconToggle` — icon-only segmented pill. `floating` fixes it in the middle above the bottom nav. Greenhouse scope and the home feed on a phone use it.
- `RefreshButton`, `PullToRefresh` (`src/components`) — refresh icon that spins while busy; phone pull-to-refresh for a window-scrolled page.
- `Switch` (`src/components`) — on/off `role="switch"` with busy spinner; System and APIs admin toggles
- `SuggestionEditorDialog` — catalog suggestion form for category, subcategory, properties, and both photos. Requests opens it from an open category row.
- `RequestsPanel` — Admin → Requests. Applications are one Server-style table, suggested categories are another. Open rows sit with added and declined rows. Each table selects, expands, and pages by 10.
- `SkeletonBar` (`src/components/Skeleton`) — shimmering bar or circle; feature skeletons are built from it. `GuestCurtain` — blurs a placeholder layout under a floating card (guest), or shows it plain while loading (member). See plantx-audience.
- `LoaderShell` — table placeholder while a live slice or admin list is still loading. Pass `busy` while a slice is in flight after the API is already up. `compact` is the rail/widget size (no skeleton rows). Server sections and System page/feature rows use `useSectionFetch`: opening one shows the loader and that header stays open until the response. A failed slice shows unavailable and can close. APIs uses the loader for providers and history. `GreenhouseLure` uses the compact shell. The greenhouse shelf, Global directory, level card and Home feed do not: while their data is in flight they show their own skeletons (`CollectionBoard skeleton="loading"`, `GreenhouseDirectorySkeleton`, `GreenhouseLevelSkeleton`, `FeedUpdateSkeleton`), so the header stays when you arrive from another page. Mock mode skips it.
- `FloatChip` — mobile-only fixed chip (draggable, tap opens sheet). Home uses `HomeMobileFloats` for greenhouse + Needs today.
- `Avatar` — colored disc with the grower's icon. The seed is the default. Further icons unlock by greenhouse level.
- `AccountDialog` — the account bubble. Private account name and email, public nickname (Save shows when it changes) and icon. Admin, language, and sign out live here. There is no profile route.
