import { personaFlags } from './personas'
import { exampleApiLive, exampleClientDb } from './examples'
import type { LivePayload } from './liveApi'
import type { MockDb } from './types'

/**
 * Bundled browse-only snapshot when the live API is unreachable.
 * Same shape as `GET /api/live`, built from the example mocks.
 */
export function shellLivePayload(): LivePayload {
  return exampleApiLive()
}

export function applyShellToDb(db: MockDb, shell: LivePayload = shellLivePayload()): MockDb {
  const example = exampleClientDb()
  return {
    ...db,
    ...example,
    system: shell.system,
    users: shell.users,
    plants: shell.plants,
    catalog: shell.catalog ?? example.catalog,
    updates: shell.updates,
    currentUserId: shell.currentUserId,
    flags: personaFlags(shell.currentUserId),
    locale: db.locale,
    visitorId: db.visitorId,
  }
}
