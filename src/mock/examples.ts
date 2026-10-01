import type { LivePayload } from './liveApi'
import { createSeed } from './seed'
import { ensureSession } from './session'
import type { MockDb } from './types'

/**
 * Client mock of `GET /api/live`.
 * The explicit `LivePayload` annotation is the source of truth — if the API shape changes, this fails to compile.
 * Storybook and the offline shell read this. QA/prod do not.
 */
export function exampleApiLive(): LivePayload {
  const seed = createSeed()
  const live: LivePayload = {
    system: seed.system,
    currentUser: null,
    meta: {
      users: seed.users.filter((user) => user.role !== 'guest').length,
      plants: seed.plants.length,
      updates: seed.updates.length,
      pending: seed.pendingUsers.filter((row) => row.status === 'pending').length,
      transactions: seed.pendingTransactions.filter((row) => row.status === 'pending').length,
      catalog: {
        categories: seed.catalog.categories.length,
        subcategories: seed.catalog.subcategories.length,
        properties: seed.catalog.properties.length,
      },
    },
    users: seed.users,
    plants: seed.plants,
    catalog: seed.catalog,
    updates: seed.updates,
    activities: seed.updates,
    currentUserId: null,
    env: 'mock',
    seed: 'demo',
    envLabel: 'local · ui mocks',
  }
  return live
}

/**
 * Storybook / local UI db.
 * API slices come from `exampleApiLive()`. Client-only slices (listings, orders, moderation) stay on the example seed until the API owns them.
 */
export function exampleClientDb(): MockDb {
  const seed = ensureSession(createSeed())
  const api = exampleApiLive()
  return {
    ...seed,
    system: api.system,
    users: api.users ?? seed.users,
    plants: api.plants ?? seed.plants,
    catalog: api.catalog ?? seed.catalog,
    updates: api.updates ?? seed.updates,
    currentUserId: api.currentUserId,
  }
}
