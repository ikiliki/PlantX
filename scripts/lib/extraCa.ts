import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function caFromEnvFile() {
  const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env')
  if (!existsSync(file)) return ''
  const line = readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .find((item) => item.trim().startsWith('PLANTX_EXTRA_CA='))
  return line ? line.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '') : ''
}

/**
 * HTTPS-scanning antivirus re-signs outbound TLS, so provider calls fail with
 * UNABLE_TO_VERIFY_LEAF_SIGNATURE. Node reads NODE_EXTRA_CA_CERTS only at startup,
 * so the dev process relaunches itself once with it set.
 */
export async function withExtraCa() {
  if (process.env.NODE_EXTRA_CA_CERTS) return
  const ca =
    (process.env.PLANTX_EXTRA_CA || caFromEnvFile()).trim() ||
    path.join(os.tmpdir(), 'plantx-win-cas.pem')
  if (!existsSync(ca)) return
  const child = spawn(process.execPath, [...process.execArgv, ...process.argv.slice(1)], {
    stdio: 'inherit',
    env: { ...process.env, NODE_EXTRA_CA_CERTS: ca },
  })
  child.on('exit', (code) => process.exit(code ?? 0))
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => child.kill(signal))
  }
  await new Promise(() => {})
}
