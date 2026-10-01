import { get, put } from '@vercel/blob'
import { normalizeSystem, type SystemConfig } from '../../../../src/theme/release.ts'
import { plantxEnv } from '../../lib/env.ts'
import { readJson, writeJson } from '../../lib/jsonStore.ts'

const SYSTEM_BLOB = 'plantx/system.json'

/** Production may mirror system.json into Blob. QA stays on its own JSON files. */
function sharedStore() {
  return plantxEnv() === 'prod' && Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)
}

async function readShared(): Promise<unknown | undefined> {
  if (!sharedStore()) return undefined
  try {
    const result = await get(SYSTEM_BLOB, { access: 'private', useCache: false })
    if (!result || result.statusCode !== 200) return undefined
    const text = await new Response(result.stream).text()
    return JSON.parse(text) as unknown
  } catch {
    return undefined
  }
}

async function writeShared(system: SystemConfig) {
  if (!sharedStore()) return
  await put(SYSTEM_BLOB, JSON.stringify(system), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 0,
  })
}

export const systemService = {
  async get() {
    const shared = await readShared()
    if (shared) return normalizeSystem(shared as Partial<SystemConfig>)
    return normalizeSystem(readJson('system.json', undefined))
  },

  async save(raw: Partial<SystemConfig>) {
    const system = normalizeSystem(raw)
    writeJson('system.json', system)
    await writeShared(system)
    return system
  },
}
