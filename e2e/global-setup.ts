import { rmSync } from 'node:fs'
import { SESSION_DIR } from './sessionDir'

/** Each run signs in fresh, once per user and run (#96). */
export default function globalSetup() {
  rmSync(SESSION_DIR, { recursive: true, force: true })
}
