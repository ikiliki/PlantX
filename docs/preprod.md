# Preprod (PP): QA per feature

Every Vercel **preview** is a PP environment: any branch, deployed against the PlantX-PP database,
with email + password sign-in and a small "PP · <name>" badge. Production never has them
(`VERCEL_ENV=production` turns them off) and keeps Google sign-in only.
The PP tooling lives in master like any other code.

Flow:
1. Work on a feature branch and push it. Vercel deploys a preview of it on PP.
2. Open a PR into master. The PR e2e runs on a QA stack on the runner, and the PP regression runs on the
   preview; both comment on the PR. Test it by hand on the preview.
3. Merge into master. That deploys production, so apply the branch's migrations to production first.

One PP database is shared by every preview. A branch with a migration needs it applied to PlantX-PP
when it is pushed, and other open branches may need to catch up (no backward compatibility).
AI testers get the preview URL of the branch they test.

## Users and logins
Passwords live in PlantX-PP's **Supabase Auth** (Authentication → Users); PlantX never stores them. The server
checks the password with Supabase, finds the PlantX user with that email, and signs its usual session cookie.

- **Admin:** `u-admin` (Omri). Its own email (`admin@preprod.invalid` when the row had none) + `PP_ADMIN_PASSWORD`.
- **Testers:** `test-user-001` … `test-user-020`, email `test-user-NNN@preprod.invalid` + `PP_TESTER_PASSWORD`.
  They're empty: no plants, todos or friends.
- **New accounts:** anyone (a person or a bot) can sign up on `/login?mode=signup` with a name, email and
  password, and is signed in at once (or waits for approval while the app is off, as with Google).
  An email PlantX already knows can't sign up again: sign in instead.
- **Catalog:** copied from production.

Switching users = sign out (account bubble → Sign out) and sign in as someone else.

Prompt for an AI agent (ChatGPT agent mode, a Playwright bot, …):

> Open <preview URL>/login. Tick the Terms box, then sign in with email `test-user-003@preprod.invalid`
> and password <tester password>. To make a new account, open <preview URL>/login?mode=signup instead and use
> a fresh email such as `bot-<anything>@preprod.invalid`. Sign out from the account bubble.

Scripts: `POST /api/session/password` with `{ email, password, termsVersion }`, or
`POST /api/session/signup` with `{ name, email, password, termsVersion }`. Both answer with the session cookie.
Sign-in and sign-up are limited to 30 per IP per 10 minutes (plus Supabase Auth's own limits).

The tester password only opens test accounts. Give agents the tester password, never the admin one.

## One-time setup (after this change)
1. PlantX-PP Supabase → Authentication → Sign In / Providers → Email: keep **Email** on, turn **Confirm email**
   off (otherwise a bot can't finish signing up without an inbox).
2. Vercel env (Preview): add `SUPABASE_URL` and `SUPABASE_ANON_KEY` (table below), remove `PLANTX_TEST_TOKEN`.
3. Give the existing users logins, without touching their data:

   ```bash
   PREPROD_DATABASE_URL=<pp url> PP_SUPABASE_URL=https://<pp ref>.supabase.co PP_SUPABASE_SECRET_KEY=<pp secret key> \
   PP_TESTER_PASSWORD=<tester password> PP_ADMIN_PASSWORD=<admin password> npm run logins:preprod
   ```

   Run it again any time to change the passwords.
4. GitHub → Settings → Secrets → Actions: add `PLANTX_PP_PASSWORD` (tester password), `PLANTX_PP_ADMIN_PASSWORD`
   and `PLANTX_PP_ADMIN_EMAIL` (the admin email the script printed); delete `PLANTX_TEST_TOKEN`.

## Vercel login wall
If Deployment Protection is on for previews, an agent hits a Vercel login page first. Do one of these:
- Settings → Deployment Protection → set Vercel Authentication to **Production only** or off.
- Or create a *Protection Bypass for Automation* secret, and have the agent open `https://<preview>/?x-vercel-protection-bypass=<secret>&x-vercel-set-bypass-cookie=true` once.

## When it is on
PP (the badge, mock identify) needs `PLANTX_PREPROD=1` and `VERCEL_ENV` not `production`.
Email + password also needs `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Otherwise the password routes return 404
and the login card shows Google only. Photo identify runs in **mock** mode on PP.

## Vercel env (Preview, all branches)

| Key | Value |
| --- | --- |
| `DATABASE_URL` | PlantX-PP session pooler URL |
| `PROD_DATABASE_URL` | same URL |
| `SESSION_SECRET` | from `.env.preprod` |
| `PLANTX_PREPROD` | `1` |
| `SUPABASE_URL` | `https://<pp ref>.supabase.co` (PlantX-PP → Project Settings → API) |
| `SUPABASE_ANON_KEY` | PlantX-PP publishable (anon) key. Server only, never a `VITE_` variable |

## Reset PP
This wipes all data and every Supabase Auth login, then recreates the admin, the prod catalog (read only),
empty testers and their logins:

```bash
PREPROD_DATABASE_URL=<pp url> CATALOG_SOURCE_URL=<prod url> PP_SUPABASE_URL=... PP_SUPABASE_SECRET_KEY=... \
PP_TESTER_PASSWORD=... PP_ADMIN_PASSWORD=... npm run seed:preprod -- --users 20
```

## Load run

```bash
PLANTX_PP_PASSWORD=<tester password> VERCEL_BYPASS=<secret> npm run load:preprod -- --base https://<preview> --users 20
```

It prints p50/p95 per endpoint and an integrity line counting plants that went missing. The sign-in limit
keeps one machine to about 25 testers.
