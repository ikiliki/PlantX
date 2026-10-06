# Backup and restore (#58)

Launch gate: **💾 Data can recover.** Everything PlantX keeps is in Postgres. Plant photos are stored as text in
`plants` / `plant_photos`, and there is no separate file storage. So one `pg_dump` of the database is the
whole backup.

## What backs up production

| Layer | What | Where | Kept |
| --- | --- | --- | --- |
| Supabase (hosted) | The plan's own backups. Check **Project → Database → Backups**: Free has none you can restore; Pro has daily backups for 7 days (point-in-time recovery is a paid add-on) | Supabase | per plan |
| **Nightly dump (ours)** | `pg_dump` of `public` + `supabase_migrations`, encrypted with `BACKUP_PASSPHRASE` (GPG AES-256) | GitHub Actions → **Backup** workflow → run artifact | 30 days |

The repo is public, so the artifact is only ever the encrypted file. Without the passphrase it can't be read.
Keep the passphrase in a password manager, **not** only in GitHub: if you lose it, the backups are useless.

Retention matches the Privacy Policy: a deleted account disappears from backups within 30 days.

## One-time setup (owner)

1. GitHub → repo **Settings → Secrets and variables → Actions** → add:
   - `PROD_DATABASE_URL`: Supabase **Connect → Session pooler** (or direct) URL. Don't use the transaction
     pooler (port 6543); `pg_dump` needs a session.
   - `BACKUP_PASSPHRASE`: 24+ random characters, also stored in your password manager.
   - `PP_DATABASE_URL`: optional, for a by-hand PP run.
2. **Actions → Backup → Run workflow** (target `prod`). Check it's green and has a `plantx-prod-….dump.gpg`
   artifact. After that it runs every night at 00:30 UTC.

## Restore drill (do once before Public Beta, then after big schema changes)

Restores into the **local QA database**, never into PP or production. The script refuses a hosted
Supabase URL without `--force`.

1. `npm run qa:up` (Docker Supabase on 54322).
2. Download the newest artifact from **Actions → Backup** and unzip it. Check the hash against the `.sha256` file.
3. Restore:

   ```bash
   BACKUP_PASSPHRASE='…' node scripts/restore-backup.mjs plantx-prod-YYYYMMDDTHHMMZ.dump.gpg
   ```

4. Boot the app on it: `npm run dev:qa`, open http://localhost:5173. Then:
   - `GET http://localhost:8787/api/health` → `ok: true`
   - Admin → System health → **Migrations** matches the build
   - Your greenhouse shows its plants and photos
5. Run the guest, read-only set against it: `npx playwright test --grep @prod`
6. Write the result in the log below: date, artifact, restore time the script printed, and pass/fail.
7. `npm run qa:reset` to put QA back.

## Restoring production for real

Only after deciding the data in production is worse than the backup (anything written since the backup is
lost):

1. Turn on maintenance: Admin → System → app closed.
2. Restore the chosen dump into production, with `--force` and the production session URL. Take a fresh
   backup first (Run workflow) so the bad state can be inspected later.
3. Check `/api/health`, then Admin → System health, then the `@prod` smoke, and reopen the app.

## Drill log

| Date | Artifact | Restore time | Result |
| --- | --- | --- | --- |
| — | — | — | not run yet |
