import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import type { Context } from 'hono'
import type { User } from '../../../src/mock/types.ts'
import { Errors } from './errors.ts'
import { plantxEnv } from './env.ts'
import { readJson } from './jsonStore.ts'

export const SESSION_COOKIE = 'plantx_session'

export function loadUsers() {
  return readJson<User[]>('users.json', [])
}

export function userFromSession(c: Context) {
  const id = getCookie(c, SESSION_COOKIE)
  if (!id) return null
  return loadUsers().find((user) => user.id === id && user.role !== 'guest') ?? null
}

/** Route auth guard — throws; middleware logs and responds. */
export function requireUser(c: Context) {
  const user = userFromSession(c)
  if (!user) throw Errors.auth()
  return user
}

export function requireAdmin(c: Context) {
  const user = requireUser(c)
  if (user.role !== 'admin') throw Errors.forbidden()
  return user
}

export function setSession(c: Context, userId: string | null) {
  if (!userId) {
    deleteCookie(c, SESSION_COOKIE, { path: '/' })
    return
  }
  setCookie(c, SESSION_COOKIE, userId, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    secure: plantxEnv() === 'prod',
    maxAge: 60 * 60 * 24 * 365,
  })
}
