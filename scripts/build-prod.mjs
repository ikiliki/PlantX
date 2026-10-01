import { spawn } from 'node:child_process'
import { mkdir, readdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

process.env.VITE_PLANTX_ENV = 'prod'
process.env.PLANTX_ENV = 'prod'

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
const apiDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../api')
await mkdir(apiDir, { recursive: true })
await build({
  entryPoints: ['server/src/vercel.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: path.join(apiDir, 'index.js'),
  packages: 'external',
  logLevel: 'info',
})
// Vercel only matches one path segment in /api bracket files, so a catch-all
// never receives /api/session/google. One index function plus a rewrite does.
for (const name of await readdir(apiDir)) {
  if (name !== 'index.js' && name.endsWith('.js')) await rm(path.join(apiDir, name))
}
