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

| Command | Web | API | Database |
| --- | --- | --- | --- |
| `npm run qa:up` then `npm run dev:qa` | http://127.0.0.1:5173 | 8787 | Local Docker Supabase |
| `npm run dev` / `dev:local` / `dev:mock` | http://127.0.0.1:5174 | none | Browser UI mocks |
| `npm run dev:prod` | http://127.0.0.1:5175 | 8789 | Hosted Supabase (`PROD_DATABASE_URL`) |

`qa:up` starts the Docker stack. Studio is at http://127.0.0.1:54323. Stop it with `npm run qa:down`. `npm run qa:reset` reapplies the schema from `supabase/migrations`.

`dev:qa` and `dev:prod` are the two local database modes. QA uses Docker. Production uses the hosted project. Both use the same Supabase driver.

On Vercel the API uses the hosted Supabase database. Set `DATABASE_URL` there to the same Postgres URI as `PROD_DATABASE_URL`.

```bash
npm run build:prod
npm run dev:api:prod
```

Serve the `dist/` client from the same host. `build:prod` bakes `VITE_PLANTX_ENV=prod` into the client. The prod API listens on `0.0.0.0`.

Storybook uses `StoreProvider source="example"` and does not read QA or production JSON.

Bootstrap admin: `omri96david@gmail.com` — **Continue with Google** only when `GOOGLE_CLIENT_ID` is set (see `.env.example`). No password for the operator account.

## Demo controls

Dark **Demo** bar (mock development only, `npm run dev`):

- Personas, locale, scenarios, reset

## Stack

Vite + React + TypeScript, React Router, styled-components, PWA. Hono API. QA uses the Docker Supabase database. Production uses the hosted Supabase database.
