---
name: plantx-identify
description: >-
  PlantX photo diagnosis pipeline, mock/live mode, request history,
  and catalog mapping. Use when changing identify routes, Pl@ntNet, Gemini,
  identify mocks, the Admin APIs playground or history, or Add Plant photo identify.
---

# PlantX identify

## Layout

`server/src/features/identify/` — providers, `mock/` fixtures, pipeline, mapper, routes.

Each provider: `status()`, an HTTP call, and a pure `parse…Body(body, catalog)`. A provider does not call another. Only `identify.service.ts` orders the steps.

## Pipeline

Add Plant (`target: chain`) runs three steps. The catalog schema is built per call, so a category or property added in admin is included on the next scan.

1. **Gate** — Gemini, photo only: is this a plant? `false` stops. Pl@ntNet is not called.
2. **Species** — Pl@ntNet names the plant and score. A failure is recorded and the draft still runs from the photo.
3. **Draft** — Gemini gets the Pl@ntNet JSON, the photo, and the current catalog (categories, subcategories, size, stage, traits). It fills only ids that exist. Empty stays empty. The server drops ids that are not in the catalog.

Gemini off, missing a key, or failing the gate stops the pipeline before Pl@ntNet. The playground can still test `gemini` or `plantnet` alone. Grower UI says AI only. Admin history shows each step, the mapped draft, and kept / changed / manual on saved fields.

## Mode

- Add Plant (`POST /api/identify`) runs the pipeline. Each stage is `ready` (live) or `mock` on its own. Gemini stores `gate` and `draft` inside its config; Pl@ntNet is the species stage. `mock` uses that stage's scenario and spends nothing.
- Settings live in `identify_provider_settings` (`enabled`, `config` jsonb). No row means enabled and ready. `PUT /api/identify/providers/:id` saves a partial patch, including `gate` or `draft`. A disabled plant check stops Add Plant. A disabled species step is skipped and the draft still runs.
- Mock `match` fills the same fields Add Plant shows: category, subcategory, size, stage, and that category's traits. Health and place stay off. Unset fields stay empty. Mock `notInCatalog` uses the chosen suggestion's names and maps to no category. `notPlant` and `error` stay the canned answers. Changing Response to Mock writes that stage and the control keeps the new value. On a healthy provider the status badge shows that stage's Ready or Mock, not the API health word. A failed save shows the server message on the stage.
- Admin playground (`POST /api/identify/test`) can target one provider, or `chain` with `stages` (gate, species, draft), each ready or mock plus a scenario. It ignores the saved switches. Mock uses the canned body. Ready calls the real API.
- UI-mock mode has no server: `src/mock/identifyMock.ts` answers on the client. Never run `live` or `POST /api/identify` in automated checks.

## History

Every request is saved to `identify_requests` (thumb, mode, source, diagnosis, steps, tried). History must never fail an identify call; a missing table is a warning. Admin reads `GET /api/identify/history?mode=`.

## Plant verification

A plant stores up to `MAX_PLANT_PHOTOS` (3) photos; each photo is scanned separately (one identify call, one request, credits each). Add Plant uploads `ADD_PLANT_UPLOAD_LIMIT` (1) for now. `PhotoIdentify` still accepts a higher `max` for stories. The client sends `identifyRequestIds[i]` for `photos[i]` (null for unscanned) with `POST /api/plants`; the server ignores client `identification`. A request is trusted only if it is `addPlant`, same owner, has no `plantId` yet, and is not repeated. `identificationFor` in `src/features/greenhouse/identification.ts` is shared by client and server: the first photo whose answer still matches the saved category/subcategory makes it `ai`, else the first plant answer makes it `edited`, else `manual`. Per-photo results (`match` | `mismatch` | `notPlant` | `failed` | `unscanned`) live in `identification.photos` / `plant_photo_checks`.

After saving, the server links each used request (`identify_requests.plant_id`, `photo_index`, `fields` = kept/changed/manual per class field) and records an `added` activity; earlier `scan` activities with those request ids get the `plantId`. Unused requests stay without a plant ("Not added" in history). `POST /api/identify` records a `scan` activity for the user. Linking never fails the add. `scan`/`added` are reserved: `POST /api/activities` rejects them. The home feed shows every kind from every greenhouse. A greenhouse shows that owner's activities, all kinds, in time order. Each identify request has a `scan` row and each plant has an `added` row in `activities` (`activityService.ensureMains` on boot). Lists stay the basic row: `GET /api/activities`, `/api/activities/{type}`, `/api/activities/{type}/{userId}`, `/api/activities/user/{userId}`. `GET /api/activities/id/{id}` adds the linked identify request. A kind check that omits `scan`/`added` drops those writes and leaves this table empty while identify history and plant cards still show.

Both tables are guarded at runtime (`to_regclass`, 42P01/42703 ignored), so a DB without `20261001170000` / `20261001180000` keeps working without verification data.

UI: `IdentifyBadge` (plant), `PhotoCheckSticker` (one photo), `PhotoChecks` (photo grid with stickers).

## Mapper

Return only catalog ids that exist. A species or common name that matches a catalog name wins over a conflicting category id. A ticker or code matches only when it is the whole token. Ties go to the scientific name, genus (first word of the binomial when missing), and label before common names. Category: name / nameHe / ticker. Subcategory: name / nameHe / code. Size, stage, health, and traits: only existing option ids. Live answers leave health empty; an admin mock match can set it. When the winner left size empty, mock uses the first size option and live calls `guessPlantSize` (Gemini, size only, errors swallowed). A live answer (Add Plant or the admin playground) that is a plant with no category asks Gemini (`draftCatalogEntry`) for a catalog draft: category name/nameHe/ticker, one subcategory name/nameHe/code, and properties with options. The scan photo is stored on both. A missing key or a Gemini error still files a draft from the provider names and the photo, with no properties. The row is `catalog_suggestions.draft`. The same scientific name increments hits and keeps the first draft. Mock runs do not file a row. The diagnosis JSON does not mention it. Admin → Requests lists open rows via `GET /api/catalog/suggestions?status=all`, with pending member applications. Add to catalog opens `SuggestionEditorDialog` and marks the row `added`. Dismiss marks it `dismissed`. Both stay in that tab's history. A missing table or `draft` column is created at runtime, and a failed write is a warning. On Add Plant, the first step is a photo, required either way. Continue with AI sends it; Fill in manually keeps the photo and leaves the plant manual. A plant answer fills the draft and slides to review. No category selects Other, and Other is also a subcategory choice (not stored). Category and subcategory chips carry a small catalog photo; on wider screens a tap previews the class and Choose selects it; on a phone a tap selects (see plantx-components). A plant answer with no catalog category, saved as Other, counts as `ai` (`classMatchesDiagnosis`), and the badge says Not in catalog. The subcategory row and later property rows stay visible and gray with no options until they apply. A chosen class shows a small white catalog mark.

## Keys

`PLANTNET_API_KEY`, `GEMINI_API_KEY`, optional `GEMINI_MODEL`. Gemini tries its model, then `MODEL_FALLBACKS` in `providers/gemini.ts`, when Google returns 404, 429, or 503. Never send keys to the browser. Admin status reports key set or not, never the secret. Grower copy does not name these providers.

## New provider

1. Add a provider file implementing the interface, with a separate parse function.
2. Add a mock fixture covering every `IdentifyMockScenario`.
3. Call it from the pipeline in `identify.service.ts` only.
4. Add an Admin APIs row (docs, credits/status). Do not show the name on Add Plant, badges, stickers, or activity text.
5. Extend `IdentifyProviderId` in `src/mock/types.ts`, the `identify_requests.target` check, the `identify_provider_settings.provider_id` check, and the `plant_identifications.provider` check.
