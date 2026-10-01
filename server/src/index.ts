import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { serve } from '@hono/node-server'
import { app, boot } from './app.ts'
import { plantxEnv } from './lib/env.ts'
import { logger } from './lib/logger.ts'

/** Load repo-root .env into process.env (no dependency). Does not override existing vars. */
function loadEnvFile() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
  const file = path.join(root, '.env')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvFile()
await boot()

const port = Number(process.env.PORT || 8787)
const hostname = plantxEnv() === 'prod' ? '0.0.0.0' : '127.0.0.1'

serve({ fetch: app.fetch, port, hostname }, (info) => {
  logger.info(`PlantX API http://${hostname}:${info.port}`)
  logger.info(`Swagger   http://127.0.0.1:${info.port}/api/docs`)
  if (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID) {
    logger.info('Google SSO enabled')
  }
})
