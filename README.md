# PlantX

Bilingual (Hebrew + English) marketplace for living inventory. Vite + React client, Hono JSON API.

## Run

```bash
npm install
npm run seed:fixtures   # once — writes server/fixtures/demo from src/mock
npm run dev             # local UI mocks, no server
```

### Modes

Local does not start a server. QA and production each talk only to their own API.

| Command | Web | API | Storage |
| --- | --- | --- | --- |
| `npm run dev:qa` | http://127.0.0.1:5173 | 8787 | `server/data` — QA JSON files (its own db until a separate QA database) |
| `npm run dev` / `dev:local` / `dev:mock` | http://127.0.0.1:5174 | none | Browser UI mocks |
| `npm run dev:prod` | http://127.0.0.1:5175 | 8789 | `server/data-prod` — production JSON files |

Local is the mocked UI and does not start a server. QA is the server you run on this machine against `server/data`. Production on Vercel uses that server's own JSON files (`server/data-prod` when you run prod here).

On the production host:

```bash
npm run build:prod
# API: PLANTX_ENV=prod PLANTX_DATA=data-prod PLANTX_SEED=empty
npm run dev:api:prod
```

Serve the `dist/` client from the same host. `build:prod` bakes `VITE_PLANTX_ENV=prod` into the client. The prod API listens on `0.0.0.0`.

Storybook uses `StoreProvider source="example"` and does not read QA or production JSON.

Bootstrap admin: `omri96david@gmail.com` — **Continue with Google** only when `GOOGLE_CLIENT_ID` is set (see `.env.example`). No password for the operator account.

## Demo controls

Dark **Demo** bar (mock development only, `npm run dev`):

- Personas, locale, scenarios, reset

## Stack

Vite + React + TypeScript, React Router, styled-components, PWA. Hono API with JSON files for system, users, plants, activities, catalog, and access queues.
