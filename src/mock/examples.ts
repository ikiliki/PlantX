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
    users: seed.users,
    plants: seed.plants,
    catalog: seed.catalog,
    updates: seed.updates,
    activities: seed.updates,
    currentUserId: null,
    env: 'local',
    seed: 'demo',
    envLabel: 'local · example mocks',
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
    users: api.users,
    plants: api.plants,
    catalog: api.catalog ?? seed.catalog,
    updates: api.updates,
    currentUserId: api.currentUserId,
  }
}
