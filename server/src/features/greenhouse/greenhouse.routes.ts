import { Hono } from 'hono'
import type { Plant, User } from '../../../../src/mock/types.ts'
import { signedIn, type SignedInEnv } from '../../lib/session.ts'
import { activityService, visibleTo } from '../activity/activity.service.ts'
import { todoService } from '../todo/todo.service.ts'
import { greenhouseService, type PlantPatch } from './greenhouse.service.ts'
import { moderationService } from '../moderation/moderation.service.ts'
import { Errors } from '../../lib/errors.ts'
import { assertPhotos } from '../../lib/images.ts'
import { rateLimit } from '../../lib/rateLimit.ts'
import { canSeePlant, loadVisibility, visiblePlants } from '../../lib/visibility.ts'

/** A hidden or private plant is "not found" for anyone but its owner and admins. */
async function visiblePlant(id: string, viewer: Pick<User, 'id' | 'role'>) {
  const [plant, index] = await Promise.all([greenhouseService.get(id), loadVisibility()])
  if (!canSeePlant(plant, index, viewer)) throw Errors.missing(`Plant ${id} not found`)
  return plant
}

/** Plants are members-only: guests see the catalog, not other growers' greenhouses. */
export const greenhouseRoutes = new Hono<SignedInEnv>()

greenhouseRoutes.use('*', signedIn)

/** Plants this member may see: none an admin hid (or whose grower is hidden) and none another grower made private. */
greenhouseRoutes.get('/', async (c) => {
  const [plants, index] = await Promise.all([greenhouseService.list(), loadVisibility()])
  return c.json({ plants: visiblePlants(plants, index, c.get('user')) })
})

greenhouseRoutes.get('/:id', async (c) => {
  const plant = await visiblePlant(c.req.param('id'), c.get('user'))
  return c.json({ plant })
})

/** Edit a saved plant: its owner, or an admin (#68). Admin edits on someone else's plant are logged. */
greenhouseRoutes.patch('/:id', async (c) => {
  const user = c.get('user')
  const patch = (await c.req.json().catch(() => ({}))) as PlantPatch
  if (patch.photos !== undefined) assertPhotos(patch.photos)
  const { plant, changed } = await greenhouseService.update(c.req.param('id'), patch, user)
  if (changed.length > 0 && plant.ownerId !== user.id) {
    await moderationService.logEdit('plant', plant.id, plant.title, user, changed)
  }
  return c.json({ plant, changed })
})

/** The owner deletes their plant (an admin may too); see greenhouseService.remove. */
greenhouseRoutes.delete('/:id', async (c) => {
  const user = c.get('user')
  const { plant, activity } = await greenhouseService.remove(c.req.param('id'), user)
  if (plant.ownerId !== user.id) await moderationService.logEdit('plant', plant.id, plant.title, user, ['deleted'])
  return c.json({ plantId: plant.id, activity })
})

/** Plant card / passport: plant from greenhouse, timeline from activity. */
greenhouseRoutes.get('/:id/activities', async (c) => {
  const plant = await visiblePlant(c.req.param('id'), c.get('user'))
  return c.json({
    plantId: plant.id,
    activities: await visibleTo(await activityService.listForPlant(plant.id), c.get('user')),
  })
})

greenhouseRoutes.post('/', rateLimit({ name: 'plant-add', max: 30, windowSeconds: 600 }), async (c) => {
  const user = c.get('user')
  const { identifyRequestIds, identifyRequestId, ...plant } = (await c.req.json()) as Plant & {
    identifyRequestIds?: unknown
    identifyRequestId?: unknown
  }
  assertPhotos(plant.photos)
  const ids = Array.isArray(identifyRequestIds) ? identifyRequestIds : [identifyRequestId]
  const created = await greenhouseService.add(
    plant,
    user.id,
    ids.map((id) => (typeof id === 'string' && id ? id : undefined)),
  )
  const [activities, todos] = await Promise.all([
    activityService.list().then((rows) => visibleTo(rows, user)),
    todoService.list({ ownerId: user.id }),
  ])
  return c.json({
    plant: created,
    /** Client still expects `updates` on live merges. */
    updates: activities,
    activities,
    todos,
  })
})
