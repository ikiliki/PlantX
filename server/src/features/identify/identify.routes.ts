import { Hono, type Context } from 'hono'
import type {
  IdentifyMockScenario,
  IdentifyMode,
  IdentifyProviderId,
  IdentifyTarget,
} from '../../../../src/mock/types.ts'
import { scanActivityText } from '../../../../src/features/greenhouse/identification.ts'
import { Errors } from '../../lib/errors.ts'
import { logger } from '../../lib/logger.ts'
import { requireAdmin, requireUser } from '../../lib/session.ts'
import { activityService } from '../activity/activity.service.ts'
import type { Activity } from '../activity/activity.types.ts'
import { identifyService, type IdentifyOutcome } from './identify.service.ts'

const MODES: IdentifyMode[] = ['mock', 'live']
const PROVIDERS: IdentifyProviderId[] = ['plantid', 'plantnet', 'gemini']
const TARGETS: IdentifyTarget[] = ['chain', ...PROVIDERS]
const SCENARIOS: IdentifyMockScenario[] = ['match', 'notInCatalog', 'notPlant', 'error']
const HISTORY_DEFAULT_LIMIT = 50
const HISTORY_MAX_LIMIT = 200

type Body = Record<string, unknown>

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
}

async function readBody(c: Context): Promise<Body> {
  const body = await c.req.json().catch(() => null)
  return body && typeof body === 'object' ? (body as Body) : {}
}

function readImage(body: Body) {
  const image = typeof body.image === 'string' ? body.image.trim() : ''
  if (!image || !/^data:image\//i.test(image)) {
    throw Errors.invalid('Body must include an image data URL')
  }
  return image
}

function readThumb(body: Body) {
  return typeof body.thumb === 'string' ? body.thumb : undefined
}

function respond(c: Context, outcome: IdentifyOutcome, activity?: Activity) {
  if (outcome.ok) return c.json({ diagnosis: outcome.diagnosis, record: outcome.record, activity })
  return c.json({ error: 'unavailable', tried: outcome.tried, record: outcome.record, activity }, 503)
}

/** The owner's greenhouse shows the scan before the plant exists. Never fails the identify call. */
async function recordScan(userId: string, outcome: IdentifyOutcome) {
  try {
    return await activityService.record({
      kind: 'scan',
      userId,
      identifyRequestId: outcome.record.id,
      ...scanActivityText(outcome.ok ? outcome.diagnosis : undefined),
    })
  } catch (err) {
    logger.error('scan activity failed', { id: outcome.record.id }, err)
    return undefined
  }
}

export const identifyRoutes = new Hono()

identifyRoutes.post('/', async (c) => {
  const user = await requireUser(c)
  const body = await readBody(c)
  const image = readImage(body)
  const outcome = await identifyService.identify(
    image,
    { mode: 'live', target: 'chain', honorEnabled: true },
    { userId: user.id, source: 'addPlant', thumb: readThumb(body) },
  )
  return respond(c, outcome, await recordScan(user.id, outcome))
})

identifyRoutes.post('/test', async (c) => {
  const user = await requireAdmin(c)
  const body = await readBody(c)
  const image = readImage(body)
  const { mode, target, scenario } = body
  if (!oneOf(mode, MODES)) throw Errors.invalid(`mode must be one of ${MODES.join(', ')}`)
  if (!oneOf(target, TARGETS)) throw Errors.invalid(`target must be one of ${TARGETS.join(', ')}`)
  if (scenario != null && !oneOf(scenario, SCENARIOS)) {
    throw Errors.invalid(`scenario must be one of ${SCENARIOS.join(', ')}`)
  }
  const outcome = await identifyService.identify(
    image,
    { mode, target, scenario: scenario ?? undefined },
    { userId: user.id, source: 'playground', thumb: readThumb(body) },
  )
  return respond(c, outcome)
})

identifyRoutes.get('/providers', async (c) => {
  await requireAdmin(c)
  const providers = await identifyService.providersStatus()
  return c.json({ providers })
})

identifyRoutes.put('/providers/:id', async (c) => {
  await requireAdmin(c)
  const id = c.req.param('id')
  if (!oneOf(id, PROVIDERS)) throw Errors.invalid(`id must be one of ${PROVIDERS.join(', ')}`)
  const body = await readBody(c)
  if (typeof body.enabled !== 'boolean') throw Errors.invalid('Body must include enabled: boolean')
  const provider = await identifyService.setEnabled(id, body.enabled)
  return c.json({ provider })
})

identifyRoutes.get('/history', async (c) => {
  await requireAdmin(c)
  const modeParam = c.req.query('mode') || undefined
  if (modeParam !== undefined && !oneOf(modeParam, MODES)) {
    throw Errors.invalid(`mode must be one of ${MODES.join(', ')}`)
  }
  const limitParam = Number.parseInt(c.req.query('limit') ?? '', 10)
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), HISTORY_MAX_LIMIT)
    : HISTORY_DEFAULT_LIMIT
  const requests = await identifyService.history({ mode: modeParam, limit })
  return c.json({ requests })
})
