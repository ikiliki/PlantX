# Preprod (PP): QA per feature

Every Vercel **preview** is a PP environment: any branch, deployed against the PlantX-PP database,
with the test login and the PP user bar. Production never has them (`VERCEL_ENV=production` turns them off).
The PP tooling lives in master like any other code.

Flow:
1. Work on a feature branch and push it. Vercel deploys a preview of it on PP.
2. Open a PR into master. The PR e2e runs on a QA stack on the runner, and the PP regression runs on the
   preview; both comment on the PR. Test it by hand on the preview with the PP bar.
3. Merge into master. That deploys production, so apply the branch's migrations to production first.

One PP database is shared by every preview. A branch with a migration needs it applied to PlantX-PP
when it is pushed, and other open branches may need to catch up (no backward compatibility).
AI testers get the preview URL of the branch they test.

## Users
- **Admin:** `u-admin` (Omri).
- **Testers:** `test-user-001` … `test-user-020`. They're empty: no plants, todos or friends.
- **Catalog:** copied from production.

## Switching users (one tab, no cookies to juggle)
Every PP page has a **"PP · <name>"** tab at the top.
1. Open it.
2. Paste the test token once. The tab remembers it.
3. Click a user, **Omri (admin)**, or **Guest**.

The page reloads as that user. While it works it shows "Switching user…".

Prompt for ChatGPT agent mode:

> Open <preview URL>. Click the "PP" tab at the top center, paste this token in "Test token": <PLANTX_TEST_TOKEN>.
> Click a tester (e.g. "Tester 3") to act as that user; click "Omri (admin)" for admin; "Guest" to sign out.
> After each click wait for the page to reload and the tab to show the new name.

Other ways in:
- **Link:** `https://<preview>/api/session/test-login?user=test-user-003&token=<token>`.
- **Script:** `POST /api/session/test-login` with header `X-Test-Token` and body `{ "userId": "test-user-003" }`.

**Rotate `PLANTX_TEST_TOKEN` after a test session.** It sits in agent transcripts.

## Vercel login wall
If Deployment Protection is on for previews, an agent hits a Vercel login page first. Do one of these:
- Settings → Deployment Protection → set Vercel Authentication to **Production only** or off.
- Or create a *Protection Bypass for Automation* secret, and have the agent open `https://<preview>/?x-vercel-protection-bypass=<secret>&x-vercel-set-bypass-cookie=true` once.

## When it is on
The PP endpoints and the bar answer only when all of these hold:
- `PLANTX_PREPROD=1`
- `PLANTX_TEST_TOKEN` is set
- `VERCEL_ENV` is not `production`

Otherwise they return 404 and the bar doesn't render. Photo identify runs in **mock** mode on PP.

## Vercel env (Preview, all branches)

| Key | Value |
| --- | --- |
| `DATABASE_URL` | PlantX-PP session pooler URL |
| `PROD_DATABASE_URL` | same URL |
| `SESSION_SECRET` | from `.env.preprod` |
| `PLANTX_PREPROD` | `1` |
| `PLANTX_TEST_TOKEN` | from `.env.preprod` |

## Reset PP
This wipes all data, then recreates the admin, the prod catalog (read only) and empty testers:

```bash
PREPROD_DATABASE_URL=<pp url> CATALOG_SOURCE_URL=<prod url> npm run seed:preprod -- --users 20
```

## Load run

```bash
PLANTX_TEST_TOKEN=<token> VERCEL_BYPASS=<secret> npm run load:preprod -- --base https://<preview> --users 20
```

It prints p50/p95 per endpoint and an integrity line counting plants that went missing.
