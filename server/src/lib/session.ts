import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import type { Context } from 'hono'
import type { User } from '../../../src/mock/types.ts'
import { getStore } from '../db/index.ts'
import { Errors } from './errors.ts'
import { plantxEnv } from './env.ts'

export const SESSION_COOKIE = 'plantx_session'

/** HMAC key for the session cookie. QA falls back to a fixed dev key; prod refuses to sign without one. */
function sessionSecret() {
  const secret = (process.env.SESSION_SECRET || '').trim()
  if (secret) return secret
  if (plantxEnv() === 'prod') throw Errors.internal('SESSION_SECRET is not set')
  return 'plantx-qa-session-secret'
}

/** The signed-in user, or null. A cookie that fails the signature check counts as signed out. */
export async function userFromSession(c: Context) {
  const id = await getSignedCookie(c, sessionSecret(), SESSION_COOKIE)
  if (!id) {
    if (id === false) deleteCookie(c, SESSION_COOKIE, { path: '/' })
    return null
  }
  const users = await getStore().users.list()
  return users.find((user) => user.id === id && user.role !== 'guest') ?? null
}

/** Route auth guard — throws; middleware logs and responds. */
export async function requireUser(c: Context) {
  const user = await userFromSession(c)
  if (!user) throw Errors.auth()
  return user
}

export async function requireAdmin(c: Context) {
  const user = await requireUser(c)
  if (user.role !== 'admin') throw Errors.forbidden()
  return user
}

export type SignedInEnv = { Variables: { user: User } }

/** Signed-in only. Handlers read the account with `c.get('user')`. */
export const signedIn = createMiddleware<SignedInEnv>(async (c, next) => {
  c.set('user', await requireUser(c))
  await next()
})

export async function setSession(c: Context, userId: string | null) {
  if (!userId) {
    deleteCookie(c, SESSION_COOKIE, { path: '/' })
    return
  }
  await setSignedCookie(c, SESSION_COOKIE, userId, sessionSecret(), {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    secure: plantxEnv() === 'prod',
    maxAge: 60 * 60 * 24 * 365,
  })
}
