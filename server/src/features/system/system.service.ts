import { normalizeSystem, type SystemConfig } from '../../../../src/theme/release.ts'
import { readJson, writeJson } from '../../lib/jsonStore.ts'

export const systemService = {
  get() {
    return normalizeSystem(readJson('system.json', undefined))
  },

  save(raw: Partial<SystemConfig>) {
    const system = normalizeSystem(raw)
    writeJson('system.json', system)
    return system
  },
}
