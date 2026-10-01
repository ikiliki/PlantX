import { spawn } from 'node:child_process'

process.env.VITE_PLANTX_ENV = 'prod'
process.env.PLANTX_ENV = 'prod'

const child = spawn('npx tsc && npx vite build', {
  stdio: 'inherit',
  shell: true,
  env: process.env,
})

child.on('exit', (code) => process.exit(code ?? 0))
