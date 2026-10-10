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
  ModerationAction,
  ModerationEntry,
  ModerationImpact,
  ModerationTarget,
  Plant,
  ScanAdjustment,
  ScanQuota,
  Todo,
  User,
  Visibility,
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
/**
 * A write keeps going on the server after the browser gives up, so a short timeout reported
 * "Something went wrong" for an approval that had succeeded (#7). Writes wait as long as the function can run.
 */
const WRITE_TIMEOUT_MS = 90_000

async function requestOutcome<T>(path: string, init?: RequestInit, timeout?: number): Promise<ApiOutcome<T>> {
  const method = (init?.method ?? 'GET').toUpperCase()
  const timeoutMs = timeout ?? (method === 'GET' || method === 'HEAD' ? REQUEST_TIMEOUT_MS : WRITE_TIMEOUT_MS)
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
  }>('/api/env')
}

/** Admin → Webhooks: env set or not (never the URL) and the on/off switch. */
export function fetchWebhooksOutcome() {
  return requestOutcome<{ webhooks: import('./types').WebhookStatus[] }>('/api/admin/webhooks')
}

export function setWebhookEnabledOutcome(id: import('./types').WebhookId, enabled: boolean) {
  return requestOutcome<{ webhooks: import('./types').WebhookStatus[] }>(`/api/admin/webhooks/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ enabled }),
  })
}

export function sendWebhookTestOutcome(id: import('./types').WebhookId) {
  return requestOutcome<{ sent: boolean }>(`/api/admin/webhooks/${id}/test`, { method: 'POST' })
}

/** Admin only: API, database, migrations, identify keys (set or not) and error counts (#56). */
/** Admin → System funnel (#59). */
export function fetchFunnelOutcome() {
  return requestOutcome<{ days: import('./types').FunnelDay[] }>('/api/events/funnel')
}

export function fetchSystemHealthOutcome() {
  return requestOutcome<{ health: import('./types').SystemHealth }>('/api/system/health')
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

/** The signed-in member agrees to this Terms version. */
export function postConsent(version: string) {
  return request<{ user: User }>('/api/session/consent', { method: 'POST', body: JSON.stringify({ version }) })
}

/** Erases the signed-in member's account and signs out. Returns the signed-out payload. */
export function deleteMyAccount() {
  return request<LivePayload>('/api/session/account', { method: 'DELETE' })
}

/** Whether the login card offers email + password (PP only), and whether this is PP. */
export function fetchPasswordAuth() {
  return request<{ enabled: boolean; preprod: boolean }>('/api/session/password')
}

/** Google sign-in. `termsVersion` is the Terms version ticked on the login page (needed to sign up). */
export function postGoogleSessionResult(credential: string, termsVersion?: string) {
  return postSignIn('/api/session/google', { credential, termsVersion })
}

/** PP: email + password sign-in (`login`) or a new account (`register`). */
export function postPasswordSessionResult(
  mode: 'login' | 'register',
  body: { email: string; password: string; name?: string; termsVersion?: string },
) {
  return postSignIn(mode === 'register' ? '/api/session/signup' : '/api/session/password', body)
}

/** A sign-in POST: the live payload, or the server's error token and message. */
async function postSignIn(path: string, body: Record<string, unknown>) {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await plantFetch(path, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (res.ok) return { ok: true as const, live: (await res.json()) as LivePayload }
    const answer = (await res.json().catch(() => null)) as { error?: string; message?: string } | null
    return { ok: false as const, error: answer?.error ?? 'auth', message: answer?.message }
  } catch {
    return { ok: false as const, error: 'offline', message: undefined }
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

/** Care plans → Suggest with AI for one category (admin). */
export function postCareSuggest(categoryId: string) {
  return requestOutcome<{ catalog: import('./types').Catalog }>(`/api/catalog/care/suggest/${encodeURIComponent(categoryId)}`, {
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

/** 🌿 on or off for one activity; answers the new count. */
export function putReaction(activityId: string, on: boolean) {
  return request<{ reactions: number; reacted: boolean }>(`/api/activities/${encodeURIComponent(activityId)}/reaction`, {
    method: on ? 'PUT' : 'DELETE',
  })
}

export function fetchComments(activityId: string) {
  return request<{ comments: import('./types').ActivityComment[] }>(
    `/api/activities/${encodeURIComponent(activityId)}/comments`,
  )
}

export function postComment(activityId: string, body: string) {
  return request<{ comment: import('./types').ActivityComment }>(
    `/api/activities/${encodeURIComponent(activityId)}/comments`,
    { method: 'POST', body: JSON.stringify({ body }) },
  )
}

/** 🌿 and comments others left on your posts. */
export function fetchMySocial() {
  return request<{ items: import('./types').GreenhouseSocialItem[] }>('/api/activities/social/mine')
}

/** Admin → Server → Reactions. */
/** Admin → Moderation → Reactions: remove one 🌿 (logged on that post). */
export function deleteAdminReaction(activityId: string, userId: string) {
  return requestOutcome<{ ok: true }>(
    `/api/admin/reactions/${encodeURIComponent(activityId)}/${encodeURIComponent(userId)}`,
    { method: 'DELETE' },
  )
}

export function fetchAdminReactionsOutcome() {
  return requestOutcome<{ reactions: import('./types').AdminReaction[] }>('/api/admin/reactions')
}

/** Admin → Moderation → Comments. */
export function fetchAdminCommentsOutcome() {
  return requestOutcome<{ comments: import('./types').AdminComment[] }>('/api/admin/comments')
}

export function deleteComment(commentId: string) {
  return request<{ ok: true }>(`/api/comments/${encodeURIComponent(commentId)}`, { method: 'DELETE' })
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
  | {
      ok: false
      /** `quota`: no AI scans left today (then `quota` is set). `rate_limited`: too many at once. */
      error: string
      tried: IdentifyTried[]
      record?: IdentifyRequestRecord
      activity?: FeedUpdate
      quota?: ScanQuota
    }

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
      quota?: ScanQuota
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
      quota: json?.quota,
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

// ── AI scan quota (#67) ─────────────────────────────────────────────────────

export function fetchScanQuota() {
  return request<{ quota: ScanQuota }>('/api/identify/quota')
}

export function fetchAdminScanQuotas() {
  return requestOutcome<{ quotas: Record<string, ScanQuota> }>('/api/admin/scans')
}

export function fetchAdminScanDetail(userId: string) {
  return requestOutcome<{ quota: ScanQuota; history: ScanAdjustment[] }>(`/api/admin/scans/${encodeURIComponent(userId)}`)
}

export function postAdminScans(
  userId: string,
  body: { kind: 'extra'; delta: number; reason: string } | { kind: 'limit'; limit: number | null; reason: string },
) {
  return requestOutcome<{ quota: ScanQuota; history: ScanAdjustment[] }>(`/api/admin/scans/${encodeURIComponent(userId)}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// ── Edit and moderation (#68, #69) ──────────────────────────────────────────

export type PlantPatch = Partial<
  Pick<
    Plant,
    | 'title'
    | 'titleHe'
    | 'description'
    | 'descriptionHe'
    | 'sizeBand'
    | 'stage'
    | 'quality'
    | 'traits'
    | 'photos'
    | 'private'
    | 'care'
  >
>

/** The owner deletes their plant (soft; an admin can restore it). The answer carries the owner's 'deleted' activity. */
export function deletePlantRequest(plantId: string) {
  return requestOutcome<{ plantId: string; activity: FeedUpdate }>(`/api/plants/${encodeURIComponent(plantId)}`, {
    method: 'DELETE',
  })
}

export function patchPlant(plantId: string, patch: PlantPatch) {
  return requestOutcome<{ plant: Plant; changed: string[] }>(`/api/plants/${encodeURIComponent(plantId)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export type UserPatch = Partial<Pick<User, 'name' | 'nickname' | 'bio' | 'bioHe' | 'region' | 'regionHe'>>

export function patchAdminUser(userId: string, patch: UserPatch) {
  return requestOutcome<{ user: User; changed: string[] }>(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export type ModerationItem = {
  type: ModerationTarget
  id: string
  label: string
  detail: string
  ownerId: string
  visibility: Visibility
  effective: Visibility
  changedAt?: string
  changedBy?: string
  reason?: string
  createdAt?: string
}

export type ModerationState = 'all' | 'moderated' | Visibility

export function fetchModerationItems(type: ModerationTarget, state: ModerationState, q = '') {
  const params = new URLSearchParams({ type, state, q })
  return requestOutcome<{ items: ModerationItem[] }>(`/api/admin/moderation/items?${params}`)
}

export function fetchModerationImpact(type: ModerationTarget, id: string) {
  const params = new URLSearchParams({ type, id })
  return requestOutcome<{ label: string; visibility: Visibility; impact: ModerationImpact }>(
    `/api/admin/moderation/impact?${params}`,
  )
}

export function postModeration(type: ModerationTarget, id: string, action: ModerationAction, reason: string) {
  return requestOutcome<{ entry: ModerationEntry; impact: ModerationImpact; visibility: Visibility }>(
    `/api/admin/moderation/${type}/${encodeURIComponent(id)}`,
    { method: 'POST', body: JSON.stringify({ action, reason }) },
  )
}

export function fetchModerationLog() {
  return requestOutcome<{ entries: ModerationEntry[] }>('/api/admin/moderation/log')
}

// ── Scans not in the catalog (#64) ───────────────────────────────────────────

export type NotInCatalogScan = {
  name: string
  scientificName: string
  scans: number
  members: number
  lastAt: string
  thumb?: string
}

export function fetchScansNotInCatalog() {
  return requestOutcome<{ scans: NotInCatalogScan[] }>('/api/admin/scans-not-in-catalog')
}
