import { spawn } from 'node:child_process'

const arg = process.argv[2]
const mode = arg === 'qa' || arg === 'prod' || arg === 'mock' ? arg : 'mock'
const ports = {
  mock: { web: '5174' },
  qa: { web: '5173', api: '8787' },
  prod: { web: '5175', api: '8789' },
} as const

const env: NodeJS.ProcessEnv = {
  ...process.env,
  VITE_PLANTX_ENV: mode,
}
const api = 'api' in ports[mode] ? ports[mode].api : undefined
if (api) env.VITE_API_PORT = api
else delete env.VITE_API_PORT

const child = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', ports[mode].web, '--strictPort'], {
  stdio: 'inherit',
  shell: true,
  env,
})

child.on('exit', (code) => process.exit(code ?? 0))
