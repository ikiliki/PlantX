import type { FeedUpdate, Plant, User } from '../../../../src/mock/types.ts'
import type { Catalog } from '../../../../src/mock/types.ts'
import type { SystemConfig } from '../../../../src/theme/release.ts'
import { plantxEnv, plantxEnvLabel, plantxSeed, type PlantxEnv, type PlantxSeed } from '../../lib/env.ts'
import { loadUsers } from '../../lib/session.ts'
import { activityService } from '../activity/activity.service.ts'
import { catalogService } from '../catalog/catalog.service.ts'
import { greenhouseService } from '../greenhouse/greenhouse.service.ts'
import { systemService } from '../system/system.service.ts'

export type LivePayload = {
  system: SystemConfig
  users: User[]
  plants: Plant[]
  catalog: Catalog
  /** Same rows as activities — keeps the existing client field name. */
  updates: FeedUpdate[]
  activities: FeedUpdate[]
  currentUserId: string | null
  env: PlantxEnv
  seed: PlantxSeed
  envLabel: string
}

export const liveService = {
  payload(currentUserId: string | null): LivePayload {
    const activities = activityService.list() as FeedUpdate[]
    return {
      system: systemService.get(),
      users: loadUsers(),
      plants: greenhouseService.list(),
      catalog: catalogService.get(),
      updates: activities,
      activities,
      currentUserId,
      env: plantxEnv(),
      seed: plantxSeed(),
      envLabel: plantxEnvLabel(),
    }
  },
}
