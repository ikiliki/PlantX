import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

/** `data` local clean db. `data-local` mock fixtures. `data-prod` production JSON db. */
function resolveDataDir() {
  const name = (process.env.PLANTX_DATA || 'data').trim()
  if (name !== 'data' && name !== 'data-local' && name !== 'data-prod') return path.join(root, 'data')
  return path.join(root, name)
}

export const dataDir = resolveDataDir()

export function readJson<T>(name: string, fallback: T): T {
  const file = path.join(dataDir, name)
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T
  } catch {
    return structuredClone(fallback)
  }
}

export function writeJson(name: string, value: unknown) {
  fs.mkdirSync(dataDir, { recursive: true })
  const file = path.join(dataDir, name)
  const temp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`)
  fs.renameSync(temp, file)
}

export function fileExists(name: string) {
  return fs.existsSync(path.join(dataDir, name))
}

/** Seeded when all core live files exist (activities may still be the legacy updates.json). */
export function hasDataFiles() {
  const activities = fileExists('activities.json') || fileExists('updates.json')
  return activities && ['system.json', 'users.json', 'plants.json'].every((name) => fileExists(name))
}
