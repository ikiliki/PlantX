import { spawn } from 'node:child_process'

const arg = process.argv[2]
// --lan listens on every interface so a phone on the same Wi-Fi can open the app.
const host = process.argv.includes('--lan') ? '0.0.0.0' : '127.0.0.1'
const mode = arg === 'qa' || arg === 'prod' || arg === 'pp' || arg === 'mock' ? arg : 'mock'
const ports = {
  mock: { web: '5174' },
  qa: { web: '5173', api: '8787' },
  prod: { web: '5175', api: '8789' },
  // Local web + API against the PlantX-PP database (scripts/dev-api-pp.ts); the client runs as prod.
  pp: { web: '5176', api: '8790' },
} as const

const env: NodeJS.ProcessEnv = {
  ...process.env,
  VITE_PLANTX_ENV: mode === 'pp' ? 'prod' : mode,
}
const api = 'api' in ports[mode] ? ports[mode].api : undefined
if (api) env.VITE_API_PORT = api
else delete env.VITE_API_PORT

const child = spawn('npx', ['vite', '--host', host, '--port', ports[mode].web, '--strictPort'], {
  stdio: 'inherit',
  shell: true,
  env,
})

child.on('exit', (code) => process.exit(code ?? 0))
