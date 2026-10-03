# Preprod: AI testers and load runs

The branch `preprod/ai-testers` is **never merged**. It deploys as a Vercel Preview of the same project, with its own Supabase database.

## Signing in without Google
Seeded testers are `test-user-001` … `test-user-NNN` (emails `@preprod.invalid`).
- **Admin persona:** `u-admin`.
- **Guest persona:** don't sign in.

**Browser AI agents (ChatGPT agent, Claude in Chrome, …).** Give the agent one link per tester. The first visit sets Vercel's bypass cookie, the second signs in.

```
https://<preview>/?x-vercel-protection-bypass=<BYPASS>&x-vercel-set-bypass-cookie=true
https://<preview>/api/session/test-login?user=test-user-001&token=<PLANTX_TEST_TOKEN>
```

It lands on `/greenhouse` signed in.

**Scripts:** `POST /api/session/test-login` with header `X-Test-Token` and body `{ "userId": "test-user-001" }`. The response sets the `plantx_session` cookie.

The token sits in URLs and agent transcripts. **Rotate `PLANTX_TEST_TOKEN` after every test session.**

## What the route needs
It answers only when all of these hold. Otherwise it returns 404.
- `PLANTX_PREPROD=1`
- `PLANTX_TEST_TOKEN` is set
- `VERCEL_ENV` is not `production`

Photo identify runs in **mock** mode on preprod, so it never calls Gemini or Pl@ntNet.

## Setup (once)
1. Create a new Supabase project. Apply the schema with `npx supabase db push --db-url <preprod url>`.
2. In Vercel, under Settings → Environment Variables, scope these to **Preview** and branch **`preprod/ai-testers`** only:
   - `PROD_DATABASE_URL`: the preprod pooler URL.
   - `SESSION_SECRET`: a new value. Generate it with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
   - `PLANTX_PREPROD=1`.
   - `PLANTX_TEST_TOKEN`: random, generated the same way.
3. Under Settings → Deployment Protection, create a **Protection Bypass for Automation** secret. That value is `<BYPASS>`.
4. Seed, then push the branch:

```bash
PREPROD_DATABASE_URL=<preprod url> npm run seed:preprod -- --users 200
```

Re-running the seed resets the testers and their plants.

## Load run

```bash
PLANTX_TEST_TOKEN=<token> VERCEL_BYPASS=<BYPASS> npm run load:preprod -- --base https://<preview> --users 200
```

The run prints:
- per-endpoint p50/p95 latency and errors;
- an **integrity** line: how many plants added during the run went missing.

Missing plants are the known whole-table `saveAll` race in `server/src/db/drivers/supabase.ts`.
