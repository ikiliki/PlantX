import { spawn } from 'node:child_process'
import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { loadEnv } from 'vite'

process.env.VITE_PLANTX_ENV = 'prod'
process.env.PLANTX_ENV = 'prod'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.join(root, '.vercel', 'output')
const funcDir = path.join(output, 'functions', 'api.func')

/**
 * Landing and app on two domains (VITE_LANDING_URL, VITE_APP_URL — the same values the client reads).
 * The landing domain serves only the marketing page and has no API; the app domain sends /landing there.
 * Unset (previews), one host serves both and there are no host rules.
 */
function siteSplitRoutes() {
  const env = { ...loadEnv('production', root, 'VITE_'), ...process.env }
  if (!env.VITE_APP_URL || !env.VITE_LANDING_URL) return { before: [], after: [] }
  const app = new URL(env.VITE_APP_URL)
  const landing = new URL(env.VITE_LANDING_URL)
  const onLanding = [{ type: 'host', value: landing.host }]
  const onApp = [{ type: 'host', value: app.host }]
  return {
    before: [{ src: '/api(?:/.*)?', has: onLanding, status: 404 }],
    after: [
      // Static files already matched; what is left on the landing host besides the page goes to the app.
      { src: '/(?!(?:landing|stills)?/?$)(.*)', has: onLanding, status: 308, headers: { Location: `${app.origin}/$1` } },
      { src: '/(?:landing|stills)/?', has: onApp, status: 308, headers: { Location: `${landing.origin}/` } },
    ],
  }
}

const siteSplit = siteSplitRoutes()

function run(command) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      stdio: 'inherit',
      shell: true,
      env: process.env,
    })
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} exited ${code}`))
    })
  })
}

await run('npx tsc && npx vite build')
await rm(output, { recursive: true, force: true })
await mkdir(funcDir, { recursive: true })
await cp(path.join(root, 'dist'), path.join(output, 'static'), { recursive: true })
await build({
  entryPoints: ['server/src/vercel.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: path.join(funcDir, 'index.js'),
  packages: 'bundle',
  external: ['pg-native'],
  logLevel: 'info',
  footer: { js: 'module.exports = module.exports.default;' },
})
await writeFile(
  path.join(funcDir, '.vc-config.json'),
  JSON.stringify({
    runtime: 'nodejs22.x',
    handler: 'index.js',
    launcherType: 'Nodejs',
    shouldAddHelpers: true,
    // Next to each database: production in Sydney, every preview (PP) next to PlantX-PP in Singapore.
    regions: [process.env.VERCEL_ENV === 'production' ? 'syd1' : 'sin1'],
  }),
)
await writeFile(
  path.join(output, 'config.json'),
  JSON.stringify({
    version: 3,
    routes: [
      ...siteSplit.before,
      { handle: 'filesystem' },
      ...siteSplit.after,
      { src: '/api(?:/(.*))?', dest: '/api' },
      { src: '/(.*)', dest: '/index.html' },
    ],
  }),
)
