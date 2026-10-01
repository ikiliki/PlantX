import { plantFetch } from '../lib/httpNotice'
import type {
  Diagnosis,
  FeedUpdate,
  IdentifyMode,
  IdentifyProviderId,
  IdentifyProviderStatus,
  IdentifyRequestRecord,
  IdentifyTestRequest,
  IdentifyTried,
  Plant,
  User,
} from './types'
import type { SystemConfig } from '../theme/release'

/** Counts only. Full rows are separate requests. */
export type LiveMeta = {
  users: number
  plants: number
  updates: number
  pending: number
  transactions: number
  catalog: {
    categories: number
    subcategories: number
    properties: number
  }
}

export type ServerSlice = 'users' | 'plants' | 'updates' | 'catalog' | 'pending' | 'transactions'

export type LivePayload = {
  system: SystemConfig
  /** Present on the server. Storybook still sends the full mock arrays below. */
  currentUser?: User | null
  meta?: LiveMeta
  /** Storybook / offline shell only. The server does not send these. */
  users?: User[]
  plants?: Plant[]
  catalog?: import('./types').Catalog
  updates?: FeedUpdate[]
  activities?: FeedUpdate[]
  currentUserId: string | null
  env?: 'mock' | 'qa' | 'prod'
  seed?: 'empty' | 'demo'
  envLabel?: string
}

const REQUEST_TIMEOUT_MS = 4000

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await plantFetch(path, {
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
  return request<{ env: 'mock' | 'qa' | 'prod'; seed: 'empty' | 'demo'; label: string }>('/api/env')
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

export function fetchPlants() {
  return request<{ plants: Plant[] }>('/api/plants')
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
    const res = await plantFetch('/api/session/google', {
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

export function postPreapproved(id: string, preapproved: boolean) {
  return request<{ user: import('./types').User }>(`/api/users/${encodeURIComponent(id)}/preapproved`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ preapproved }),
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

/** `identifyRequestId` lets the server credit the provider. The server sets `identification` itself. */
/** `identifyRequestIds[i]` belongs to `plant.photos[i]`. */
export function postPlant(plant: Plant, identifyRequestIds: (string | undefined)[] = []) {
  return request<{ plant: Plant; updates: FeedUpdate[] }>('/api/plants', {
    method: 'POST',
    body: JSON.stringify({ ...plant, identifyRequestIds: identifyRequestIds.map((id) => id ?? null) }),
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

const IDENTIFY_TIMEOUT_MS = 30_000

type IdentifyResult =
  | { ok: true; diagnosis: Diagnosis; record?: IdentifyRequestRecord; activity?: FeedUpdate }
  | { ok: false; error: string; tried: IdentifyTried[]; record?: IdentifyRequestRecord; activity?: FeedUpdate }

/** Identify calls can walk three providers, so they get a longer timeout than `request`. */
async function identifyRequest(path: string, body: unknown): Promise<IdentifyResult> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), IDENTIFY_TIMEOUT_MS)
  try {
    const res = await plantFetch(path, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const json = (await res.json().catch(() => null)) as {
      diagnosis?: Diagnosis
      record?: IdentifyRequestRecord
      activity?: FeedUpdate
      error?: string
      tried?: IdentifyTried[]
    } | null
    if (res.ok && json?.diagnosis) {
      return { ok: true, diagnosis: json.diagnosis, record: json.record, activity: json.activity }
    }
    return {
      ok: false,
      error: json?.error ?? 'unavailable',
      tried: json?.tried ?? [],
      record: json?.record,
      activity: json?.activity,
    }
  } catch {
    return { ok: false, error: 'offline', tried: [] }
  } finally {
    window.clearTimeout(timer)
  }
}

/** Add Plant. Always live on the server; providers the admin switched off are skipped. */
export function postIdentify(image: string, thumb?: string) {
  return identifyRequest('/api/identify', { image, thumb })
}

/** Admin playground. Mode, target, and mock scenario are chosen per run. */
export function postIdentifyTest(body: IdentifyTestRequest) {
  return identifyRequest('/api/identify/test', body)
}

export function fetchIdentifyProviders() {
  return request<{ providers: IdentifyProviderStatus[] }>('/api/identify/providers')
}

/** Admin switch for Add Plant. Resolves to the updated status, or null on failure. */
export async function setIdentifyProviderEnabled(id: IdentifyProviderId, enabled: boolean) {
  const res = await request<{ provider: IdentifyProviderStatus }>(
    `/api/identify/providers/${encodeURIComponent(id)}`,
    { method: 'PUT', body: JSON.stringify({ enabled }) },
  )
  return res?.provider ?? null
}

export function fetchIdentifyHistory(query?: { mode?: IdentifyMode; limit?: number }) {
  const params = new URLSearchParams()
  if (query?.mode) params.set('mode', query.mode)
  if (query?.limit != null) params.set('limit', String(query.limit))
  const qs = params.toString()
  return request<{ requests: IdentifyRequestRecord[] }>(`/api/identify/history${qs ? `?${qs}` : ''}`)
}
