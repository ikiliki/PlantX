import { getRequestListener } from '@hono/node-server'
import { app, boot } from './app.ts'

await boot()

// Built to api/index.js. vercel.json rewrites every /api/* path here.
// Vercel keeps the browser path on req.url, so Hono still sees /api/session/google.
export default getRequestListener(app.fetch)
