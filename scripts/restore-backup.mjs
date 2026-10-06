#!/usr/bin/env node
/**
 * Restore a PlantX backup (#58) into a scratch database. docs/backup.md has the whole drill.
 *
 *   BACKUP_PASSPHRASE=... node scripts/restore-backup.mjs <file.dump.gpg> [target-url]
 *
 * target-url defaults to the local QA database (Docker Supabase, `npm run qa:up`). It refuses a hosted
 * Supabase URL unless --force is passed, so a drill can never overwrite PP or production by mistake.
 * Needs gpg (Git for Windows ships it) and Docker (pg_restore runs in postgres:17).
 */
import { execFileSync } from 'node:child_process'
import { existsSync, rmSync, statSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'

const args = process.argv.slice(2).filter((arg) => !arg.startsWith('--'))
const force = process.argv.includes('--force')
const [file, targetArg] = args
const LOCAL_QA = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
const target = targetArg || LOCAL_QA
const passphrase = process.env.BACKUP_PASSPHRASE ?? ''

function fail(message) {
  console.error(`restore: ${message}`)
  process.exit(1)
}

if (!file || !existsSync(file)) fail('pass the downloaded .dump.gpg file')
if (!passphrase) fail('set BACKUP_PASSPHRASE')
if (/supabase\.(co|com)/.test(target) && !force) fail('target is a hosted Supabase database; pass --force only if you mean it')

const started = Date.now()
const dir = dirname(resolve(file))
const dump = resolve(dir, `${basename(file).replace(/\.gpg$/, '')}.restore`)

try {
  console.log('Decrypting…')
  execFileSync(
    'gpg',
    ['--batch', '--yes', '--pinentry-mode', 'loopback', '--passphrase-fd', '0', '--output', dump, '--decrypt', resolve(file)],
    { input: passphrase, stdio: ['pipe', 'inherit', 'inherit'] },
  )
  console.log(`Dump: ${statSync(dump).size} bytes`)

  // From inside Docker, the host's 127.0.0.1 is host.docker.internal.
  const dockerTarget = target.replace(/@(127\.0\.0\.1|localhost)([:/])/, '@host.docker.internal$2')
  console.log('Restoring…')
  execFileSync(
    'docker',
    [
      'run', '--rm', '--add-host=host.docker.internal:host-gateway',
      '-e', 'TARGET', '-v', `${dir}:/in`, 'postgres:17',
      'sh', '-c', `pg_restore --clean --if-exists --no-owner --no-privileges --exit-on-error -d "$TARGET" "/in/${basename(dump)}"`,
    ],
    { stdio: 'inherit', env: { ...process.env, TARGET: dockerTarget } },
  )
} finally {
  rmSync(dump, { force: true })
}

const seconds = Math.round((Date.now() - started) / 1000)
console.log(`Restored into ${target.replace(/:[^:@/]+@/, ':***@')} in ${seconds}s. Record this time in docs/backup.md.`)
