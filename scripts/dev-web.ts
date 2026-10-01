import { spawn } from 'node:child_process'

const mode = process.argv[2] === 'mock' || process.argv[2] === 'prod' ? process.argv[2] : 'local'
const ports = {
  mock: { api: '8788', web: '5174' },
  local: { api: '8787', web: '5173' },
  prod: { api: '8789', web: '5175' },
} as const

const child = spawn('npx', ['vite', '--host', '127.0.0.1', '--port', ports[mode].web, '--strictPort'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    VITE_API_PORT: ports[mode].api,
    VITE_PLANTX_ENV: mode,
  },
})

child.on('exit', (code) => process.exit(code ?? 0))
