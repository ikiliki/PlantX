import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { swaggerUI } from '@hono/swagger-ui'
import { ensureDataFiles } from './lib/ensureData.ts'
import { plantxEnv, plantxEnvLabel, plantxSeed } from './lib/env.ts'
import { onError, onNotFound } from './middleware/errorHandler.ts'
import { openApiDocument } from './openapi.ts'
import { activityRoutes } from './features/activity/activity.routes.ts'
import { catalogRoutes } from './features/catalog/catalog.routes.ts'
import { greenhouseRoutes } from './features/greenhouse/greenhouse.routes.ts'
import { liveRoutes } from './features/live/live.routes.ts'
import { sessionRoutes } from './features/session/session.routes.ts'
import { systemRoutes } from './features/system/system.routes.ts'
import { usersRoutes } from './features/users/users.routes.ts'

ensureDataFiles()

export const app = new Hono()

app.onError(onError)
app.notFound(onNotFound)

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
app.get('/api/env', (c) =>
  c.json({
    env: plantxEnv(),
    seed: plantxSeed(),
    label: plantxEnvLabel(),
  }),
)

app.route('/api/live', liveRoutes)
app.route('/api/session', sessionRoutes)
app.route('/api/users', usersRoutes)
app.route('/api/system', systemRoutes)
app.route('/api/catalog', catalogRoutes)
app.route('/api/activities', activityRoutes)
app.route('/api/plants', greenhouseRoutes)
