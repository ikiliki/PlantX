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

- **Skip** when key missing, credits/quota gone, or call fails/times out.
- **Stop** when a provider answers, even if nothing matches the catalog.
- Plant.id `is_plant: false` is an answer.

## Mode

- `mock` builds a body in the provider's real response shape and runs the same parser and mapper. No network, no credits, ignores keys.
- `live` calls the APIs.
- Add Plant (`POST /api/identify`) uses `IDENTIFY_MODE`; default is live in prod, mock otherwise.
- Admin playground (`POST /api/identify/test`) picks mode, target (chain or one provider), and mock scenario per run.
- UI-mock mode has no server: `src/mock/identifyMock.ts` answers on the client.
- Never run `live` in automated checks.

## History

Every request is saved to `identify_requests` (thumb, mode, source, diagnosis, tried). History must never fail an identify call; a missing table is a warning. Admin reads `GET /api/identify/history?mode=`.

## Mapper

Return only catalog ids that exist. Category: name / nameHe / ticker. Subcategory: name / nameHe / code. Grade, size, stage, traits: only existing option ids (Gemini only).

## Keys

`KINDWISE_API_KEY`, `PLANTNET_API_KEY`, `GEMINI_API_KEY`, optional `GEMINI_MODEL`, `IDENTIFY_MODE`. Never send keys to the browser. Admin status reports key set or not, never the secret.

## New provider

1. Add a provider file implementing the interface, with a separate parse function.
2. Add a mock fixture covering every `IdentifyMockScenario`.
3. Register it in the chain.
4. Add an Admin APIs row (docs, credits/status).
5. Extend `IdentifyProviderId` in `src/mock/types.ts` and the `identify_requests.target` check.
