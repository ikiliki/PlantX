import type { FeedUpdate, Plant, User } from './types'
import type { SystemConfig } from '../theme/release'

export type LivePayload = {
  system: SystemConfig
  users: User[]
  plants: Plant[]
  catalog?: import('./types').Catalog
  updates: FeedUpdate[]
  activities?: FeedUpdate[]
  currentUserId: string | null
  env?: 'mock' | 'local' | 'prod'
  seed?: 'empty' | 'demo'
  envLabel?: string
}

const REQUEST_TIMEOUT_MS = 4000

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      ...init,
      signal: controller.signal,
    })
    if (!res.ok) return null
    if (res.status === 204) return {} as T
    return (await res.json()) as T
  } catch {
    return null
  } finally {
    window.clearTimeout(timer)
  }
}

export function fetchEnv() {
  return request<{ env: 'mock' | 'local' | 'prod'; seed: 'empty' | 'demo'; label: string }>('/api/env')
}

export function fetchLive() {
  return request<LivePayload>('/api/live')
}

export function fetchActivities(query?: { plantId?: string; userId?: string; limit?: number }) {
  const params = new URLSearchParams()
  if (query?.plantId) params.set('plantId', query.plantId)
  if (query?.userId) params.set('userId', query.userId)
  if (query?.limit != null) params.set('limit', String(query.limit))
  const qs = params.toString()
  return request<{ activities: FeedUpdate[] }>(`/api/activities${qs ? `?${qs}` : ''}`)
}

export function fetchPlant(plantId: string) {
  return request<{ plant: Plant }>(`/api/plants/${encodeURIComponent(plantId)}`)
}

export function fetchPlantActivities(plantId: string) {
  return request<{ plantId: string; activities: FeedUpdate[] }>(
    `/api/plants/${encodeURIComponent(plantId)}/activities`,
  )
}

export function postSession(body: { email?: string; userId?: string | null }) {
  return request<LivePayload>('/api/session', { method: 'POST', body: JSON.stringify(body) })
}

export function fetchGoogleAuth() {
  return request<{ enabled: boolean; clientId: string | null }>('/api/session/google')
}

export function postGoogleSession(credential: string) {
  return request<LivePayload>('/api/session/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  })
}

/** Same as postGoogleSession but returns the API error token when login fails. */
export async function postGoogleSessionResult(credential: string) {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch('/api/session/google', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
      signal: controller.signal,
    })
    if (res.ok) return { ok: true as const, live: (await res.json()) as LivePayload }
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    return { ok: false as const, error: body?.error ?? 'auth' }
  } catch {
    return { ok: false as const, error: 'offline' }
  } finally {
    window.clearTimeout(timer)
  }
}

export function postRegister(body: { name: string; email: string; note?: string }) {
  return request<{ pending: import('./types').PendingUser }>('/api/users/pending', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function fetchPendingUsers(status: 'pending' | 'approved' | 'rejected' = 'pending') {
  return request<{ pending: import('./types').PendingUser[] }>(
    `/api/users/pending?status=${encodeURIComponent(status)}`,
  )
}

export function fetchPendingUser(id: string) {
  return request<{ pending: import('./types').PendingUser }>(
    `/api/users/pending/${encodeURIComponent(id)}`,
  )
}

export function postApprovePending(id: string) {
  return request<{ pending: import('./types').PendingUser; user: import('./types').User }>(
    `/api/users/pending/${encodeURIComponent(id)}/approve`,
    { method: 'POST' },
  )
}

export function postRejectPending(id: string) {
  return request<{ pending: import('./types').PendingUser }>(
    `/api/users/pending/${encodeURIComponent(id)}/reject`,
    { method: 'POST' },
  )
}

export function fetchMembers() {
  return request<{ users: import('./types').User[] }>('/api/users')
}

export function postDisableUser(id: string) {
  return request<{ user: import('./types').User }>(`/api/users/${encodeURIComponent(id)}/disable`, {
    method: 'POST',
  })
}

export function postEnableUser(id: string) {
  return request<{ user: import('./types').User }>(`/api/users/${encodeURIComponent(id)}/enable`, {
    method: 'POST',
  })
}

export function fetchPendingTransactions() {
  return request<{ transactions: import('./types').PendingTransaction[] }>(
    '/api/users/transactions/pending',
  )
}

export function putCatalog(catalog: import('./types').Catalog) {
  return request<{ catalog: import('./types').Catalog }>('/api/catalog', {
    method: 'PUT',
    body: JSON.stringify({ catalog }),
  })
}

export function putSystem(system: SystemConfig) {
  return request<{ system: SystemConfig }>('/api/system', { method: 'PUT', body: JSON.stringify(system) })
}

export function postPlant(plant: Plant) {
  return request<{ plant: Plant; updates: FeedUpdate[] }>('/api/plants', {
    method: 'POST',
    body: JSON.stringify(plant),
  })
}

export function postPlantWater(plantId: string) {
  return request<{ plant: Plant; update: FeedUpdate; updates: FeedUpdate[] }>(
    `/api/plants/${encodeURIComponent(plantId)}/water`,
    { method: 'POST' },
  )
}

export function postPlantPhoto(plantId: string) {
  return request<{ plant: Plant; update: FeedUpdate; updates: FeedUpdate[] }>(
    `/api/plants/${encodeURIComponent(plantId)}/photo`,
    { method: 'POST' },
  )
}
