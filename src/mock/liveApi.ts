import { failureFromResponse, failureFromThrow, type ApiOutcome } from '../lib/apiFailure'
import { plantFetch } from '../lib/httpNotice'
import type { IssueReport } from '../lib/issueReport'
import type {
  Diagnosis,
  FeedUpdate,
  IdentifyMode,
  IdentifyProviderId,
  IdentifyProviderSettings,
  IdentifyProviderStatus,
  IdentifyRequestRecord,
  IdentifyTestRequest,
  IdentifyTried,
  Plant,
  Todo,
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

export type ServerSlice = 'users' | 'plants' | 'updates' | 'todos' | 'catalog' | 'pending' | 'transactions'

/** Everything except the catalog is members-only on the server; a guest never asks for it. */
export function guestCanLoad(slice: ServerSlice) {
  return slice === 'catalog'
}

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

/** Cold production calls the hosted database across regions, so 4s was aborting a live answer. */
const REQUEST_TIMEOUT_MS = 20000

async function requestOutcome<T>(
  path: string,
  init?: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<ApiOutcome<T>> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await plantFetch(path, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      ...init,
      signal: controller.signal,
    })
    if (!res.ok) return { ok: false, failure: await failureFromResponse(res) }
    if (res.status === 204) return { ok: true, data: {} as T }
    return { ok: true, data: (await res.json()) as T }
  } catch (err) {
    return { ok: false, failure: failureFromThrow(err) }
  } finally {
    window.clearTimeout(timer)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  const outcome = await requestOutcome<T>(path, init)
  return outcome.ok ? outcome.data : null
}

export type EnvGap = { name: string; need: 'app' | 'identify' }

export function fetchEnv() {
  return request<{
    env: 'mock' | 'qa' | 'prod'
    seed: 'empty' | 'demo'
    label: string
    missing: EnvGap[]
  }>('/api/env')
}

export function fetchLive() {
  return request<LivePayload>('/api/live')
}

export function fetchLiveOutcome() {
  return requestOutcome<LivePayload>('/api/live')
}

export function fetchActivities(query?: { plantId?: string; userId?: string; limit?: number }) {
  const params = new URLSearchParams()
  if (query?.plantId) params.set('plantId', query.plantId)
  if (query?.userId) params.set('userId', query.userId)
  if (query?.limit != null) params.set('limit', String(query.limit))
  const qs = params.toString()
  return request<{ activities: FeedUpdate[] }>(`/api/activities${qs ? `?${qs}` : ''}`)
}

export function fetchActivitiesOutcome() {
  return requestOutcome<{ activities: FeedUpdate[] }>('/api/activities')
}

export function fetchTodos(query?: { open?: boolean }) {
  const params = new URLSearchParams()
  if (query?.open) params.set('open', '1')
  const qs = params.toString()
  return request<{ todos: Todo[] }>(`/api/todos${qs ? `?${qs}` : ''}`)
}

/** Every grower's public level, keyed by user id (Global directory). */
export function fetchGreenhouseLevels() {
  return request<{ levels: Record<string, import('../features/greenhouse/greenhouseLevel').GreenhouseLevel> }>(
    '/api/users/levels',
  )
}

/** Public greenhouse level for another grower: counts and XP only (their tasks stay private). */
export function fetchGreenhouseLevel(ownerId: string) {
  return request<{ level: import('../features/greenhouse/greenhouseLevel').GreenhouseLevel }>(
    `/api/users/${encodeURIComponent(ownerId)}/level`,
  )
}

export function fetchTodosOutcome() {
  return requestOutcome<{ todos: Todo[] }>('/api/todos')
}

export function fetchPlants() {
  return request<{ plants: Plant[] }>('/api/plants')
}

/** Plant rows include photo data, so this read waits longer than the usual 4s call. */
const PLANTS_TIMEOUT_MS = 20_000

export function fetchPlantsOutcome() {
  return requestOutcome<{ plants: Plant[] }>('/api/plants', undefined, PLANTS_TIMEOUT_MS)
}

export function fetchPlant(plantId: string) {
  return request<{ plant: Plant }>(`/api/plants/${encodeURIComponent(plantId)}`)
}

export function fetchPlantActivities(plantId: string) {
  return request<{ plantId: string; activities: FeedUpdate[] }>(
    `/api/plants/${encodeURIComponent(plantId)}/activities`,
  )
}

/** Signed-in account only. Nickname is private; the icon must already be unlocked. */
export function patchAccount(body: { nickname?: string; avatarIcon?: string }) {
  return request<{ user: User }>('/api/session/account', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
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

export function fetchPendingUsers(status: 'pending' | 'approved' | 'rejected' | 'all' = 'pending') {
  return request<{ pending: import('./types').PendingUser[] }>(
    `/api/users/pending?status=${encodeURIComponent(status)}`,
  )
}

export function fetchPendingUsersOutcome(status: 'pending' | 'approved' | 'rejected' | 'all' = 'pending') {
  return requestOutcome<{ pending: import('./types').PendingUser[] }>(
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

export function fetchMembersOutcome() {
  return requestOutcome<{ users: import('./types').User[] }>('/api/users')
}

/** Public greenhouses. Omits the admin unless the signed-in viewer is the admin. */
export function fetchDirectoryOutcome() {
  return requestOutcome<{ users: import('./types').User[] }>('/api/users/directory')
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

export function fetchPendingTransactionsOutcome() {
  return requestOutcome<{ transactions: import('./types').PendingTransaction[] }>(
    '/api/users/transactions/pending',
  )
}

export function fetchCatalogOutcome() {
  return requestOutcome<{ catalog: import('./types').Catalog }>('/api/catalog')
}

export function fetchCatalogSuggestions(status: 'open' | 'dismissed' | 'added' | 'all' = 'open') {
  const query = status === 'open' ? '' : `?status=${encodeURIComponent(status)}`
  return request<{ suggestions: import('./types').CatalogSuggestion[] }>(`/api/catalog/suggestions${query}`).then(
    (body) => body?.suggestions ?? null,
  )
}

/** The member's own open suggestions (pending in their Catalog). */
export function fetchMyCatalogSuggestions() {
  return request<{ suggestions: import('./types').CatalogSuggestion[] }>('/api/catalog/suggestions/mine').then(
    (body) => body?.suggestions ?? null,
  )
}

export function postCatalogSuggestion(input: import('./types').CatalogSuggestionInput) {
  return requestOutcome<{ suggestion: import('./types').CatalogSuggestion }>('/api/catalog/suggestions', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function dismissCatalogSuggestion(id: string) {
  return request<{ ok: boolean }>(`/api/catalog/suggestions/${encodeURIComponent(id)}/dismiss`, {
    method: 'POST',
  })
}

export function acceptCatalogSuggestion(id: string) {
  return request<{ ok: boolean }>(`/api/catalog/suggestions/${encodeURIComponent(id)}/accept`, {
    method: 'POST',
  })
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
  return request<{ plant: Plant; updates: FeedUpdate[]; todos?: Todo[] }>('/api/plants', {
    method: 'POST',
    body: JSON.stringify({ ...plant, identifyRequestIds: identifyRequestIds.map((id) => id ?? null) }),
  })
}

export function postTodoComplete(todoId: string, completedOn?: string) {
  return request<{
    todo: Todo
    todos: Todo[]
    plant: Plant
    activity: FeedUpdate | null
    update: FeedUpdate | null
    updates: FeedUpdate[]
  }>(`/api/todos/${encodeURIComponent(todoId)}/complete`, {
    method: 'POST',
    body: JSON.stringify(completedOn ? { completedOn } : {}),
  })
}

/** The server runs up to three AI steps, each allowed 20s across model fallbacks. */
const IDENTIFY_TIMEOUT_MS = 60_000

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

/** Add Plant. Each provider follows its admin switch: ready calls the API, mock uses the saved answer. */
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

export function fetchIdentifyProvidersOutcome() {
  return requestOutcome<{ providers: IdentifyProviderStatus[] }>('/api/identify/providers')
}

/** Admin switch for Add Plant. The failure keeps the server message for the stage panel. */
export function setIdentifyProviderSettings(
  id: IdentifyProviderId,
  patch: Partial<IdentifyProviderSettings>,
) {
  return requestOutcome<{ provider: IdentifyProviderStatus }>(
    `/api/identify/providers/${encodeURIComponent(id)}`,
    { method: 'PUT', body: JSON.stringify(patch) },
    45000,
  )
}

export function fetchIdentifyHistory(query?: { mode?: IdentifyMode; limit?: number }) {
  const params = new URLSearchParams()
  if (query?.mode) params.set('mode', query.mode)
  if (query?.limit != null) params.set('limit', String(query.limit))
  const qs = params.toString()
  return request<{ requests: IdentifyRequestRecord[] }>(`/api/identify/history${qs ? `?${qs}` : ''}`)
}

export function fetchIssuesOutcome() {
  return requestOutcome<{ issues: IssueReport[] }>('/api/issues')
}

export function setIssueStatus(id: string, status: 'resolved' | 'dismissed') {
  const action = status === 'resolved' ? 'resolve' : 'dismiss'
  return requestOutcome<{ ok: boolean }>(`/api/issues/${encodeURIComponent(id)}/${action}`, { method: 'POST' })
}

export function fetchIdentifyHistoryOutcome(query?: { mode?: IdentifyMode; limit?: number }) {
  const params = new URLSearchParams()
  if (query?.mode) params.set('mode', query.mode)
  if (query?.limit != null) params.set('limit', String(query.limit))
  const qs = params.toString()
  return requestOutcome<{ requests: IdentifyRequestRecord[] }>(`/api/identify/history${qs ? `?${qs}` : ''}`)
}
