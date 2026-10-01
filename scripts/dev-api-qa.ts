import net from 'node:net'

process.env.PLANTX_ENV = 'qa'
process.env.PLANTX_SEED = 'empty'
process.env.PLANTX_DB = 'supabase'
// This script is the local Docker QA database. Hosted Supabase is a host env var, not this URL.
process.env.DATABASE_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
process.env.PORT = '8787'

const port = Number(new URL(process.env.DATABASE_URL).port || 54322)
const open = await new Promise<boolean>((resolve) => {
  const socket = net.connect({ port, host: '127.0.0.1' })
  const done = (value: boolean) => {
    socket.removeAllListeners()
    socket.destroy()
    resolve(value)
  }
  socket.once('connect', () => done(true))
  socket.once('error', () => done(false))
})

if (!open) {
  console.error('QA database is not running on 127.0.0.1:' + port + '.')
  console.error('Start Docker, then: npm run qa:up')
  process.exit(1)
}

await import('../server/src/index.ts')
