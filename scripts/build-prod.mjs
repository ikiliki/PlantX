import { spawn } from 'node:child_process'
import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

process.env.VITE_PLANTX_ENV = 'prod'
process.env.PLANTX_ENV = 'prod'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.join(root, '.vercel', 'output')
const funcDir = path.join(output, 'functions', 'api.func')

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
    regions: ['syd1'],
  }),
)
await writeFile(
  path.join(output, 'config.json'),
  JSON.stringify({
    version: 3,
    routes: [
      { handle: 'filesystem' },
      { src: '/api(?:/(.*))?', dest: '/api' },
      { src: '/(.*)', dest: '/index.html' },
    ],
  }),
)
