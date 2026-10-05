import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { bodyLimit } from 'hono/body-limit'
import { secureHeaders } from 'hono/secure-headers'
import { swaggerUI } from '@hono/swagger-ui'
import { ensureDataFiles } from './lib/ensureData.ts'
import { plantxDb, plantxEnv, plantxEnvLabel, plantxSeed } from './lib/env.ts'
import { missingEnv } from './lib/requiredEnv.ts'
import { onError, onNotFound } from './middleware/errorHandler.ts'
import { openApiDocument } from './openapi.ts'
import { activityRoutes } from './features/activity/activity.routes.ts'
import { catalogRoutes } from './features/catalog/catalog.routes.ts'
import { greenhouseRoutes } from './features/greenhouse/greenhouse.routes.ts'
import { identifyRoutes } from './features/identify/identify.routes.ts'
import { issueRoutes } from './features/issues/issues.routes.ts'
import { liveRoutes } from './features/live/live.routes.ts'
import { sessionRoutes } from './features/session/session.routes.ts'
import { systemRoutes } from './features/system/system.routes.ts'
import { todoRoutes } from './features/todo/todo.routes.ts'
import { usersRoutes } from './features/users/users.routes.ts'
import { adminRoutes } from './features/admin/admin.routes.ts'

let booted: Promise<void> | null = null

/** Seed the active store once. Safe to call from the process entry and the first request. */
export function boot() {
  if (!booted) booted = ensureDataFiles()
  return booted
}

export const app = new Hono()

app.onError(onError)
app.notFound(onNotFound)

/** No database. Answers even when Postgres is slow, so admin can show empty env names. */
app.get('/api/env', (c) =>
  c.json({
    env: plantxEnv(),
    seed: plantxSeed(),
    db: plantxDb(),
    label: plantxEnvLabel(),
    missing: missingEnv(),
  }),
)

/** API response headers (#45): no MIME sniffing, no framing, no referrer leaking across sites. */
app.use(
  '/api/*',
  secureHeaders({
    xFrameOptions: 'DENY',
    referrerPolicy: 'strict-origin-when-cross-origin',
    crossOriginResourcePolicy: 'same-origin',
  }),
)

/** Requests over this are refused before the handler (Vercel also caps a function body at 4.5 MB). */
app.use('/api/*', bodyLimit({ maxSize: 10 * 1024 * 1024 }))

app.use('*', async (c, next) => {
  await boot()
  await next()
})

app.use(
  '*',
  cors({
    origin: [
      'http://127.0.0.1:5173',
      'http://localhost:5173',
      'http://127.0.0.1:5174',
      'http://localhost:5174',
      'http://127.0.0.1:5175',
      'http://localhost:5175',
    ],
    credentials: true,
  }),
)

app.get('/api/openapi.json', (c) => c.json(openApiDocument))
app.get('/api/docs', swaggerUI({ url: '/api/openapi.json' }))

app.route('/api/live', liveRoutes)
app.route('/api/session', sessionRoutes)
app.route('/api/users', usersRoutes)
app.route('/api/system', systemRoutes)
app.route('/api/catalog', catalogRoutes)
app.route('/api/identify', identifyRoutes)
app.route('/api/issues', issueRoutes)
app.route('/api/activities', activityRoutes)
app.route('/api/todos', todoRoutes)
app.route('/api/plants', greenhouseRoutes)
app.route('/api/admin', adminRoutes)
