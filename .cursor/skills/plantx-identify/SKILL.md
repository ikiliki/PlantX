---
name: plantx-identify
description: >-
  PlantX photo diagnosis providers, fallback chain, mock/live mode, request history,
  and catalog mapping. Use when changing identify routes, Plant.id, Pl@ntNet, Gemini,
  identify mocks, the Admin APIs playground or history, or Add Plant photo identify.
---

# PlantX identify

## Layout

`server/src/features/identify/` — providers, `mock/` fixtures, chain, mapper, routes.

Each provider: `status()`, an HTTP call, and a pure `parse…Body(body, catalog)`. A provider does not call another.

## Chain order

Only `identify.service.ts` knows the order: Plant.id → Pl@ntNet → Gemini.

- **Skip** when disabled by admin (Add Plant only), key missing, credits/quota gone, or call fails/times out.
- **Stop** when a provider answers, even if nothing matches the catalog.
- Plant.id `is_plant: false` is an answer.

## Mode

- Add Plant (`POST /api/identify`) walks the chain. Each provider is `ready` (live) or `mock` from admin config. `ready` calls the real API. `mock` uses the saved scenario and spends nothing.
- Settings live in `identify_provider_settings` (`enabled`, `config` jsonb). No row means enabled and ready. `PUT /api/identify/providers/:id` saves a partial patch. Add Plant skips a disabled provider with reason `disabled`; all off → 503.
- Mock `match` fills the category, the subcategory when that switch is on, and any properties set (grade, size, stage, traits, more properties). Unset properties stay empty. Mock `notInCatalog` uses the chosen suggestion's names and maps to no category. `notPlant` and `error` stay the canned answers.
- Admin playground (`POST /api/identify/test`) picks mode, target, and scenario per run, and ignores `enabled` and `response`. `mock` builds a body in the provider's real response shape and runs the same parser and mapper (no network, no credits). `live` calls the real API with the real key.
- UI-mock mode has no server: `src/mock/identifyMock.ts` answers on the client. Never run `live` or `POST /api/identify` in automated checks.

## History

Every request is saved to `identify_requests` (thumb, mode, source, diagnosis, tried). History must never fail an identify call; a missing table is a warning. Admin reads `GET /api/identify/history?mode=`.

## Plant verification

A plant stores up to `MAX_PLANT_PHOTOS` (3) photos; each photo is scanned separately (one identify call, one request, credits each). Add Plant uploads `ADD_PLANT_UPLOAD_LIMIT` (1) for now. `PhotoIdentify` still accepts a higher `max` for stories. The client sends `identifyRequestIds[i]` for `photos[i]` (null for unscanned) with `POST /api/plants`; the server ignores client `identification`. A request is trusted only if it is `addPlant`, same owner, has no `plantId` yet, and is not repeated. `identificationFor` in `src/features/greenhouse/identification.ts` is shared by client and server: the first photo whose answer still matches the saved category/subcategory makes it `ai`, else the first plant answer makes it `edited`, else `manual`. Per-photo results (`match` | `mismatch` | `notPlant` | `failed` | `unscanned`) live in `identification.photos` / `plant_photo_checks`.

After saving, the server links each used request (`identify_requests.plant_id`, `photo_index`, `fields` = kept/changed/manual per class field) and records an `added` activity; earlier `scan` activities with those request ids get the `plantId`. Unused requests stay without a plant ("Not added" in history). `POST /api/identify` records a `scan` activity for the user. Linking never fails the add. `scan`/`added` are reserved: `POST /api/activities` rejects them. The home feed shows every kind from every greenhouse. A greenhouse shows that owner's activities, all kinds, in time order. Each identify request has a `scan` row and each plant has an `added` row in `activities` (`activityService.ensureMains` on boot). Lists stay the basic row: `GET /api/activities`, `/api/activities/{type}`, `/api/activities/{type}/{userId}`, `/api/activities/user/{userId}`. `GET /api/activities/id/{id}` adds the linked identify request. A kind check that omits `scan`/`added` drops those writes and leaves this table empty while identify history and plant cards still show.

Both tables are guarded at runtime (`to_regclass`, 42P01/42703 ignored), so a DB without `20261001170000` / `20261001180000` keeps working without verification data.

UI: `IdentifyBadge` (plant), `PhotoCheckSticker` (one photo), `PhotoChecks` (photo grid with stickers).

## Mapper

Return only catalog ids that exist. Category: name / nameHe / ticker. Subcategory: name / nameHe / code. Size, stage, grade, and traits: only existing option ids. Live answers leave grade empty; an admin mock match can set it. When the winner left size empty, mock uses the first size option and live calls `guessPlantSize` (Gemini, size only, errors swallowed). A live answer (Add Plant or the admin playground) that is a plant with no category asks Gemini (`draftCatalogEntry`) for a catalog draft: category name/nameHe/ticker, one subcategory name/nameHe/code, and properties with options. The scan photo is stored on both. A missing key or a Gemini error still files a draft from the provider names and the photo, with no properties. The row is `catalog_suggestions.draft`. The same scientific name increments hits and keeps the first draft. Mock runs do not file a row. The diagnosis JSON does not mention it. Admin → Requests lists open rows via `GET /api/catalog/suggestions?status=all`, with pending member applications. Add to catalog opens `SuggestionEditorDialog` and marks the row `added`. Dismiss marks it `dismissed`. Both stay in that tab's history. A missing table or `draft` column is created at runtime, and a failed write is a warning. On Add Plant, a plant answer with no category tells the grower and selects Other, which has no subcategory.

## Keys

`KINDWISE_API_KEY`, `PLANTNET_API_KEY`, `GEMINI_API_KEY`, optional `GEMINI_MODEL`. Gemini tries its model, then `MODEL_FALLBACKS` in `providers/gemini.ts`, when Google returns 404, 429, or 503. Never send keys to the browser. Admin status reports key set or not, never the secret.

## New provider

1. Add a provider file implementing the interface, with a separate parse function.
2. Add a mock fixture covering every `IdentifyMockScenario`.
3. Register it in the chain.
4. Add an Admin APIs row (docs, credits/status).
5. Extend `IdentifyProviderId` in `src/mock/types.ts`, the `identify_requests.target` check, the `identify_provider_settings.provider_id` check, the `plant_identifications.provider` check, and `PROVIDER_LABEL` / `PROVIDER_CHAIN` in `src/features/greenhouse/identification.ts`.
