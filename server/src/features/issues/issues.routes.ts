import { Hono } from 'hono'
import { ISSUE_NOTE_WORDS, sanitizeContext, wordCount } from '../../../../src/lib/issueReport.ts'
import { getStore } from '../../db/index.ts'
import { Errors } from '../../lib/errors.ts'
import { requireAdmin, userFromSession } from '../../lib/session.ts'

export const issueRoutes = new Hono()

issueRoutes.post('/', async (c) => {
  const user = await userFromSession(c)
  const body = (await c.req.json().catch(() => null)) as { note?: unknown; context?: unknown } | null
  const note = typeof body?.note === 'string' ? body.note.trim() : ''
  if (wordCount(note) > ISSUE_NOTE_WORDS) throw Errors.invalid('Note is longer than 50 words')
  const context = sanitizeContext(body?.context)
  if (!context) throw Errors.invalid('Report is missing error details')
  const issue = await getStore().issueReports.add({ userId: user?.id ?? null, note, context })
  return c.json({ issue }, 201)
})

issueRoutes.get('/', async (c) => {
  await requireAdmin(c)
  const issues = await getStore().issueReports.list()
  return c.json({ issues })
})

issueRoutes.post('/:id/resolve', async (c) => {
  await requireAdmin(c)
  await getStore().issueReports.setStatus(c.req.param('id'), 'resolved')
  return c.json({ ok: true })
})

issueRoutes.post('/:id/dismiss', async (c) => {
  await requireAdmin(c)
  await getStore().issueReports.setStatus(c.req.param('id'), 'dismissed')
  return c.json({ ok: true })
})
