import { normalizeSystem, type SystemConfig } from '../../../../src/theme/release.ts'
import { getStore } from '../../db/index.ts'

export const systemService = {
  async get() {
    return normalizeSystem((await getStore().system.get()) ?? undefined)
  },

  async save(raw: Partial<SystemConfig>) {
    const system = normalizeSystem(raw)
    await getStore().system.save(system)
    return system
  },
}
