import type { User } from '../../../../src/mock/types.ts'
import type { SystemConfig } from '../../../../src/theme/release.ts'
import { getStore } from '../../db/index.ts'
import { plantxEnv, plantxEnvLabel, plantxSeed, type PlantxEnv, type PlantxSeed } from '../../lib/env.ts'
import { activityService } from '../activity/activity.service.ts'
import { catalogService } from '../catalog/catalog.service.ts'
import { greenhouseService } from '../greenhouse/greenhouse.service.ts'
import { systemService } from '../system/system.service.ts'
import { usersService } from '../users/users.service.ts'

/** Counts for every server collection. Full rows stay on their own routes. */
export type LiveMeta = {
  users: number
  plants: number
  updates: number
  pending: number
  transactions: number
  catalog: {
    categories: number
    subcategories: number
    properties: number
  }
}

export type LivePayload = {
  system: SystemConfig
  /** Signed-in account only. The directory is GET /api/users. */
  currentUser: User | null
  currentUserId: string | null
  meta: LiveMeta
  env: PlantxEnv
  seed: PlantxSeed
  envLabel: string
}

export const liveService = {
  async payload(currentUserId: string | null): Promise<LivePayload> {
    const [system, users, plantCount, activities, pending, transactions, catalog] = await Promise.all([
      systemService.get(),
      getStore().users.list(),
      greenhouseService.count(),
      activityService.list(),
      usersService.countPending(),
      usersService.countPendingTransactions(),
      catalogService.counts(),
    ])
    const members = users.filter((user) => user.role !== 'guest')
    return {
      system,
      currentUser: users.find((user) => user.id === currentUserId) ?? null,
      currentUserId,
      meta: {
        users: members.length,
        plants: plantCount,
        updates: activities.length,
        pending,
        transactions,
        catalog,
      },
      env: plantxEnv(),
      seed: plantxSeed(),
      envLabel: plantxEnvLabel(),
    }
  },
}
