# PlantX

Bilingual (Hebrew + English) marketplace for living inventory. Vite + React client, Hono JSON API.

## Run

```bash
npm install
npm run seed:fixtures   # once — writes server/fixtures/demo from src/mock
npm run dev             # mock development
```

### Modes

Each mode is its own client and its own API. Nothing proxies at another mode's server.

| Command | Web | API | Storage |
| --- | --- | --- | --- |
| `npm run dev` / `dev:mock` | http://127.0.0.1:5174 | 8788 | `server/data-local` — demo fixtures |
| `npm run dev:local` | http://127.0.0.1:5173 | 8787 | `server/data` — empty JSON db |
| `npm run dev:prod` | http://127.0.0.1:5175 | 8789 | `server/data-prod` — empty JSON db, prod env |

Mock is for development (demo bar, fixtures). Local is the clean stack you run on this machine. Prod is the same shape as what you deploy: that client talks only to that server, and the server writes only `server/data-prod`.

On the production host:

```bash
npm run build:prod
# API: PLANTX_ENV=prod PLANTX_DATA=data-prod PLANTX_SEED=empty
npm run dev:api:prod
```

Serve the `dist/` client from the same host. `build:prod` bakes `VITE_PLANTX_ENV=prod` into the client. The prod API listens on `0.0.0.0`.

Storybook uses `StoreProvider source="example"` and does not read mock, local, or prod JSON.

Bootstrap admin: `omri96david@gmail.com` — **Continue with Google** only when `GOOGLE_CLIENT_ID` is set (see `.env.example`). No password for the operator account.

## Demo controls

Dark **Demo** bar (mock development only, `npm run dev`):

- Personas, locale, scenarios, reset

## Stack

Vite + React + TypeScript, React Router, styled-components, PWA. Hono API with JSON files for system, users, plants, activities, catalog, and access queues.
