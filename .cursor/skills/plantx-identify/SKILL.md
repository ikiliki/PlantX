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

- Add Plant (`POST /api/identify`) is always `live`. No mock in the real path.
- Each provider has an admin `enabled` flag in `identify_provider_settings` (no row = enabled), set by `PUT /api/identify/providers/:id`. Add Plant skips a disabled provider with reason `disabled`; all off → 503.
- Admin playground (`POST /api/identify/test`) picks mode, target (chain or one provider), and mock scenario per run, and ignores `enabled`. `mock` builds a body in the provider's real response shape and runs the same parser and mapper (no network, no credits). `live` calls the real API with the real key.
- UI-mock mode has no server: `src/mock/identifyMock.ts` answers on the client.
- Never run `live` (or `POST /api/identify`) in automated checks.

## History

Every request is saved to `identify_requests` (thumb, mode, source, diagnosis, tried). History must never fail an identify call; a missing table is a warning. Admin reads `GET /api/identify/history?mode=`.

## Plant verification

A plant stores up to `MAX_PLANT_PHOTOS` (3) photos; each photo is scanned separately (one identify call, one request, credits each). Add Plant uploads `ADD_PLANT_UPLOAD_LIMIT` (1) for now. `PhotoIdentify` still accepts a higher `max` for stories. The client sends `identifyRequestIds[i]` for `photos[i]` (null for unscanned) with `POST /api/plants`; the server ignores client `identification`. A request is trusted only if it is `addPlant`, same owner, has no `plantId` yet, and is not repeated. `identificationFor` in `src/features/greenhouse/identification.ts` is shared by client and server: the first photo whose answer still matches the saved category/subcategory makes it `ai`, else the first plant answer makes it `edited`, else `manual`. Per-photo results (`match` | `mismatch` | `notPlant` | `failed` | `unscanned`) live in `identification.photos` / `plant_photo_checks`.

After saving, the server links each used request (`identify_requests.plant_id`, `photo_index`, `fields` = kept/changed/manual per class field) and records an `added` activity; earlier `scan` activities with those request ids get the `plantId`. Unused requests stay without a plant ("Not added" in history). `POST /api/identify` records a `scan` activity for the user. Linking never fails the add. `scan`/`added` are reserved: `POST /api/activities` rejects them. The home feed shows every kind from every greenhouse. A greenhouse shows that owner's activities, all kinds, in time order. Each identify request has a `scan` row and each plant has an `added` row in `activities` (`activityService.ensureMains` on boot). Lists stay the basic row: `GET /api/activities`, `/api/activities/{type}`, `/api/activities/{type}/{userId}`, `/api/activities/user/{userId}`. `GET /api/activities/id/{id}` adds the linked identify request. A kind check that omits `scan`/`added` drops those writes and leaves this table empty while identify history and plant cards still show.

Both tables are guarded at runtime (`to_regclass`, 42P01/42703 ignored), so a DB without `20261001170000` / `20261001180000` keeps working without verification data.

UI: `IdentifyBadge` (plant), `PhotoCheckSticker` (one photo), `PhotoChecks` (photo grid with stickers).

## Mapper

Return only catalog ids that exist. Category: name / nameHe / ticker. Subcategory: name / nameHe / code. Size, stage, and traits: only existing option ids. Grade is left empty; growers grade later. When the winner left size empty, mock uses the first size option and live calls `guessPlantSize` (Gemini, size only, errors swallowed). A live answer (Add Plant or the admin playground) that is a plant with no category writes `catalog_suggestions` (same scientific name increments hits). Mock runs do not. The diagnosis JSON does not mention it. Admin catalog lists open rows via `GET /api/catalog/suggestions`; dismiss is admin-only. A missing table is created at runtime, and a failed write is a warning.

## Keys

`KINDWISE_API_KEY`, `PLANTNET_API_KEY`, `GEMINI_API_KEY`, optional `GEMINI_MODEL`. Gemini tries its model, then `MODEL_FALLBACKS` in `providers/gemini.ts`, when Google returns 404, 429, or 503. Never send keys to the browser. Admin status reports key set or not, never the secret.

## New provider

1. Add a provider file implementing the interface, with a separate parse function.
2. Add a mock fixture covering every `IdentifyMockScenario`.
3. Register it in the chain.
4. Add an Admin APIs row (docs, credits/status).
5. Extend `IdentifyProviderId` in `src/mock/types.ts`, the `identify_requests.target` check, the `identify_provider_settings.provider_id` check, the `plant_identifications.provider` check, and `PROVIDER_LABEL` / `PROVIDER_CHAIN` in `src/features/greenhouse/identification.ts`.
