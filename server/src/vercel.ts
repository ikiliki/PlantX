import { getRequestListener } from '@hono/node-server'
import { app } from './app.ts'

// The first request seeds the database. Boot stays inside the app so a failed
// connection returns JSON instead of crashing the function at import.
export default getRequestListener(app.fetch)
