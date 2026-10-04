import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createCatalog } from './catalog'
import { saveCatalogFile } from './catalogFile'
import { areaById, fieldsFromPlace, resolveArea, UNKNOWN_AREA } from './locations'
import { createSeed } from './seed'
import type {
  Catalog,
  CommunityGradeLetter,
  FeedUpdate,
  Locale,
  PlantIdentification,
  DemoScenarios,
  MockDb,
  ModerationStatus,
  PublishResult,
  QualityGrade,
  SizeBand,
  Species,
  StageBand,
  Todo,
  User,
} from './types'
import { PLACEMENTS, type FeatureId, type PageId, type PageStatus, type PlacementId, type ReleaseMode } from '../theme/release'
import { publishBlocker } from '../features/greenhouse/communityGrade'
import { supportedLocales } from '../i18n/locales'
import { defaultPlantPhoto } from './images'
import type { ApiFailure } from '../lib/apiFailure'
import { siteRole } from '../lib/siteUrls'
import { notifyCareDone } from '../lib/httpNotice'
import { CARE_XP } from '../features/greenhouse/greenhouseLevel'
import {
  fetchActivitiesOutcome,
  fetchCatalogOutcome,
  fetchLiveOutcome,
  fetchGoogleAuth,
  fetchDirectoryOutcome,
  fetchMembersOutcome,
  fetchPendingTransactions,
  fetchPendingTransactionsOutcome,
  fetchPendingUsers,
  fetchPendingUsersOutcome,
  fetchPlantsOutcome,
  postApprovePending,
  postDisableUser,
  postEnableUser,
  postPreapproved,
  postGoogleSessionResult,
  patchAccount,
  postPlant,
  postTodoComplete,
  postRejectPending,
  postSession,
  putSystem,
  fetchTodosOutcome,
  type LiveMeta,
  type LivePayload,
  type ServerSlice,
} from './liveApi'
import { exampleClientDb } from './examples'
import { personaFlags } from './personas'
import { normalizeSystem } from '../theme/release'
import { projectDb } from './projectDb'
import { ensureSession, normalizeScenarios } from './session'
import { clientEnv, clientEnvLabel, type ClientEnv } from '../theme/plantxEnv'
import { cleanNickname } from '../features/profile/avatarIcons'
import { OPERATOR_EMAIL } from '../theme/operator'
import {
  addDays,
  addMonths,
  ensureFirstWaterTodo,
  isFirstWaterTodo,
  openTodo,
  PHOTO_GAP_MONTHS,
  careFillWindow,
  schedulePhotoTodo,
  todayIso,
  WATER_GAP_DAYS,
} from '../features/todo/todoSchedule'

const STORAGE_KEY = 'plantx-mock-db-v8'

export type LiveStatus = 'loading' | 'up' | 'down'

/** QA/prod start empty. Demo plants live only in example mocks and local mode. */
function emptyDb(): MockDb {
  const seed = ensureSession(createSeed())
  return {
    ...seed,
    users: [],
    plants: [],
    species: [],
    listings: [],
    orders: [],
    offers: [],
    threads: [],
    moderation: [],
    claimDrafts: [],
    updates: [],
    todos: [],
    topGreenhouses: [],
    pendingUsers: [],
    pendingTransactions: [],
    marketClasses: [],
    catalog: { categories: [], subcategories: [], properties: [] },
    currentUserId: null,
  }
}

function loadDb(): MockDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return ensureSession(JSON.parse(raw) as MockDb)
  } catch {
    /* ignore */
  }
  return emptyDb()
}

function saveDb(db: MockDb) {
  const copy = structuredClone(db)
  ensureSession(copy)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(copy))
}

function actorId(db: MockDb) {
  const user = db.users.find((item) => item.id === db.currentUserId)
  if (!user || user.role === 'guest') return null
  return user.id
}

function uniqueId(base: string, taken: string[]) {
  if (!taken.includes(base)) return base
  let n = 2
  while (taken.includes(`${base}-${n}`)) n += 1
  return `${base}-${n}`
}

/** Only owner uploads. The catalog photo is derived from the category, never stored here. */
function plantPhotos(own: string[] = []) {
  const photos = own.map((photo) => photo.trim()).filter(Boolean)
  return photos.length > 0 ? photos : [defaultPlantPhoto]
}

interface StoreApi {
  db: MockDb
  /** Rows before demo scenarios trim them. Admin reads the activity log from here. */
  fullDb: MockDb
  currentUser: User | null
  signedIn: boolean
  /** Live API reachability. Components read this; they do not fetch. */
  liveStatus: LiveStatus
  /** Why the last live check failed. Null while the API is up. */
  liveFailure: ApiFailure | null
  /** Slices whose last fetch failed. Absent means that list is fine or not loaded yet. */
  sliceFailures: Partial<Record<ServerSlice, ApiFailure>>
  /** True only when the server is up — live writes go through. */
  liveWritable: boolean
  /** mock = browser UI, no server. qa = QA JSON files. prod = production files. */
  plantxEnv: ClientEnv
  plantxEnvLabel: string
  plantxSeed: 'empty' | 'demo'
  retryLive: () => Promise<void>
  setLocale: (locale: Locale) => void
  /** Owner greenhouse place. New plants copy it. Unknown until they choose. */
  setGreenhousePlace: (areaId: string) => void
  /** Private nickname and the public avatar icon. */
  setAccount: (patch: { nickname?: string; avatarIcon?: string }) => Promise<boolean>
  setDemoScenarios: (patch: Partial<DemoScenarios>) => void
  /** Which system control is waiting on the server. Null when idle. */
  systemPending: string | null
  setAppLaunched: (launched: boolean) => void
  setPageStatus: (pageId: PageId, status: PageStatus) => void
  setFeatureEnabled: (featureId: FeatureId, enabled: boolean) => void
  setFeatureStatus: (featureId: FeatureId, status: ReleaseMode) => void
  setPlacementEnabled: (placement: PlacementId, enabled: boolean) => void
  loginAs: (userId: string | null) => void
  loginByEmail: (email: string) => Promise<boolean>
  /** Google Identity Services ID token → session. */
  loginWithGoogle: (credential: string) => Promise<{ ok: true } | { ok: false; reason: string }>
  /** Local UI only. Any admin SSO click signs in the operator. No server. */
  loginWithMockSso: () => Promise<{ ok: true } | { ok: false; reason: string }>
  approvePendingUser: (id: string) => Promise<boolean>
  rejectPendingUser: (id: string) => Promise<boolean>
  disableUser: (id: string) => Promise<boolean>
  enableUser: (id: string) => Promise<boolean>
  setPreapproved: (id: string, preapproved: boolean) => Promise<boolean>
  liveMeta: LiveMeta | null
  loadSlice: (part: ServerSlice) => Promise<boolean>
  /** Fetch a slice again even if it already loaded (pull-to-refresh, the refresh icon). */
  reloadSlice: (part: ServerSlice) => Promise<boolean>
  refreshAccessQueue: (part: 'pending' | 'transactions') => Promise<void>
  resetDemo: () => void
  createListing: (input: {
    plantId: string
    price: number
    quantity: number
    unit: 'plant' | 'cutting' | 'bundle'
    allowOffers: boolean
  }) => PublishResult
  /** Anonymous community grade from the Rank stack. */
  gradePlant: (plantId: string, letter: CommunityGradeLetter) => void
  ungradePlant: (plantId: string) => void
  refreshPhoto: (plantId: string) => void
  confirmWater: (plantId: string) => void
  /** Complete a care todo. First watering requires `completedOn`. */
  completeTodo: (todoId: string, completedOn?: string) => void
  addGreenhousePlant: (input: {
    title: string
    titleHe: string
    description: string
    descriptionHe: string
    /** Up to three. Empty uses the default plant photo. */
    photos?: string[]
    speciesId: string
    variety: string
    varietyHe: string
    quality: QualityGrade | ''
    sizeBand: SizeBand
    stage: StageBand
    code: string
    marketClassId?: string
    subcategoryId?: string
    traits?: Record<string, string>
    location: { region: string; regionHe: string; lat: number; lng: number }
    /** Shown until the server answers with its own record. */
    identification?: PlantIdentification
    /** Per photo, the identify request that scanned it. */
    identifyRequestIds?: (string | undefined)[]
  }) => string
  /** Merge one activity the server already saved (an Add Plant scan), or a local one in UI-mock mode. */
  noteActivity: (update: FeedUpdate) => void
  commitCatalog: (
    fn: (ctx: { catalog: Catalog; species: Species[] }) => {
      catalog: Catalog
      species?: Species[]
    },
  ) => void
  purchaseClass: (marketClassId: string) => string | null
  createPlantBatch: (input: {
    speciesId: string
    title: string
    titleHe: string
    quantity: number
    quality: QualityGrade
    rooting: 'rooted' | 'unrooted' | 'established'
    parentId?: string
    photo?: string
    location: { region: string; regionHe: string; lat: number; lng: number }
  }) => string
  makeOffer: (input: {
    listingId: string
    amount: number
    message: string
    messageHe: string
  }) => void
  setOfferStatus: (id: string, status: 'accepted' | 'declined' | 'withdrawn') => void
  completeHandoff: (orderId: string) => void
  resolveModeration: (id: string, status: ModerationStatus) => void
  claimDraft: (draftId: string) => void
  reserveListing: (listingId: string) => string
  sendMessage: (threadId: string, body: string, bodyHe: string) => void
  setFeedFriendsOnly: (value: boolean) => void
  setVerifiedGreenhouses: (ids: string[]) => void
}

const StoreContext = createContext<StoreApi | null>(null)

export function StoreProvider({
  source = 'api',
  children,
}: {
  /** `example` = storybook UI mocks. `api` = QA or production server, unless the client env is mock. */
  source?: 'api' | 'example'
  children: ReactNode
}) {
  const example = source === 'example'
  const uiMocks = example || clientEnv() === 'mock'
  /** The landing domain has no API; it only needs locale and static content. */
  const offline = !uiMocks && siteRole() === 'landing'
  const [db, setDb] = useState<MockDb>(() => (uiMocks ? exampleClientDb() : loadDb()))
  const [liveStatus, setLiveStatus] = useState<LiveStatus>(uiMocks || offline ? 'up' : 'loading')
  const [runtimeEnv, setRuntimeEnv] = useState<ClientEnv>(() => (uiMocks ? 'mock' : clientEnv()))
  const [runtimeEnvLabel, setRuntimeEnvLabel] = useState(() => clientEnvLabel(uiMocks ? 'mock' : clientEnv()))
  const [runtimeSeed, setRuntimeSeed] = useState<'empty' | 'demo'>(uiMocks ? 'demo' : 'empty')

  useEffect(() => {
    if (!uiMocks) saveDb(db)
  }, [db, uiMocks])

  const update = useCallback((fn: (prev: MockDb) => MockDb) => {
    setDb((prev) => fn(structuredClone(prev)))
  }, [])

  const [liveMeta, setLiveMeta] = useState<LiveMeta | null>(null)
  const [liveFailure, setLiveFailure] = useState<ApiFailure | null>(null)
  const [sliceFailures, setSliceFailures] = useState<Partial<Record<ServerSlice, ApiFailure>>>({})
  /** In-flight or finished slice fetches. A failed fetch is removed so the next open can retry. */
  const sliceJobs = useRef(new Map<ServerSlice, Promise<boolean>>())
  /** Slices whose rows came from the API. A later live payload must not clear them. */
  const sliceReady = useRef<Partial<Record<ServerSlice, boolean>>>({})
  /** Only an admin may read the members list; kept current during render so loadSlice reads it without a dep. */
  const isAdminRef = useRef(false)
  /** Drops a stale `/api/live` when React runs the boot effect twice. */
  const liveGen = useRef(0)

  const applyLive = useCallback((live: LivePayload) => {
    if (live.meta) setLiveMeta(live.meta)
    const listedUsers = live.users ?? (live.currentUser ? [live.currentUser] : [])
    const userIds = new Set(listedUsers.map((user) => user.id))
    const plants = (live.plants ?? []).filter((plant) => userIds.size === 0 || userIds.has(plant.ownerId))
    const plantIds = new Set(plants.map((plant) => plant.id))
    const updates = (live.updates ?? []).filter(
      (row) => userIds.size === 0 || (userIds.has(row.userId) && (!row.plantId || plantIds.has(row.plantId))),
    )
    update((d) => {
      if (live.env === 'mock' && live.users && live.plants && live.updates) {
        const example = exampleClientDb()
        return {
          ...example,
          system: normalizeSystem(live.system),
          users: live.users,
          plants,
          catalog: live.catalog ?? example.catalog,
          updates,
          currentUserId: live.currentUserId,
          flags: personaFlags(live.currentUserId),
          listings: example.listings.filter((listing) => plantIds.has(listing.plantId) && userIds.has(listing.sellerId)),
          locale: d.locale,
          visitorId: d.visitorId,
          verifiedGreenhouseIds: d.verifiedGreenhouseIds ?? null,
        }
      }
      const emptyCatalog = { categories: [], subcategories: [], properties: [] }
      return {
        ...d,
        system: normalizeSystem(live.system),
        users: listedUsers,
        plants: live.plants ? plants : sliceReady.current.plants ? d.plants : [],
        catalog: live.catalog ?? (sliceReady.current.catalog ? d.catalog : emptyCatalog),
        updates: live.updates ? updates : sliceReady.current.updates ? d.updates : [],
        currentUserId: live.currentUserId,
        flags: personaFlags(live.currentUserId),
        moderation: [],
        listings: [],
        marketClasses: [],
        orders: [],
        topGreenhouses: [],
        pendingUsers: [],
        pendingTransactions: [],
      }
    })
    if (live.env === 'mock' || live.env === 'qa' || live.env === 'prod') setRuntimeEnv(live.env)
    if (live.envLabel) setRuntimeEnvLabel(live.envLabel)
    if (live.seed) setRuntimeSeed(live.seed)
  }, [update])

  const retryLive = useCallback(async () => {
    const gen = ++liveGen.current
    sliceJobs.current.clear()
    sliceReady.current = {}
    setSliceFailures({})
    setLiveStatus('loading')
    const outcome = await fetchLiveOutcome()
    if (gen !== liveGen.current) return
    if (outcome.ok) {
      applyLive(outcome.data)
      setLiveFailure(null)
      setLiveStatus('up')
      return
    }
    setLiveFailure(outcome.failure)
    setLiveStatus('down')
  }, [applyLive])

  const [systemPending, setSystemPending] = useState<string | null>(null)
  const systemSave = useRef(false)
  const saveSystem = useCallback(async (key: string, next: MockDb['system']) => {
    if (uiMocks) {
      update((d) => ({ ...d, system: normalizeSystem(next) }))
      return
    }
    if (systemSave.current) return
    systemSave.current = true
    setSystemPending(key)
    try {
      const res = await putSystem(next)
      if (res?.system) update((d) => ({ ...d, system: normalizeSystem(res.system) }))
    } finally {
      systemSave.current = false
      setSystemPending(null)
    }
  }, [uiMocks, update])

  const noteSlice = useCallback((part: ServerSlice, failure: ApiFailure | null) => {
    setSliceFailures((current) => {
      if (!failure) {
        if (!current[part]) return current
        const next = { ...current }
        delete next[part]
        return next
      }
      return { ...current, [part]: failure }
    })
  }, [])

  const loadSlice = useCallback((part: ServerSlice) => {
    if (uiMocks) return Promise.resolve(false)
    const existing = sliceJobs.current.get(part)
    if (existing) return existing
    const job = (async (): Promise<boolean> => {
      if (part === 'users') {
        // Growers and guests never call the admin-only members list; the public directory is theirs.
        // Admins read the full list, but still fall back to the directory on an unexpected 401/403.
        if (isAdminRef.current) {
          const members = await fetchMembersOutcome()
          if (members.ok) {
            noteSlice(part, null)
            update((d) => {
              d.users = members.data.users
              return d
            })
            return true
          }
          if (members.failure.status !== 401 && members.failure.status !== 403) {
            noteSlice(part, members.failure)
            return false
          }
        }
        const directory = await fetchDirectoryOutcome()
        if (!directory.ok) {
          noteSlice(part, directory.failure)
          return false
        }
        noteSlice(part, null)
        update((d) => {
          d.users = directory.data.users
          return d
        })
        return true
      }
      if (part === 'plants') {
        const res = await fetchPlantsOutcome()
        if (!res.ok) {
          noteSlice(part, res.failure)
          return false
        }
        noteSlice(part, null)
        sliceReady.current.plants = true
        update((d) => {
          d.plants = res.data.plants
          return d
        })
        return true
      }
      if (part === 'updates') {
        const res = await fetchActivitiesOutcome()
        if (!res.ok) {
          noteSlice(part, res.failure)
          return false
        }
        noteSlice(part, null)
        sliceReady.current.updates = true
        update((d) => {
          d.updates = res.data.activities
          return d
        })
        return true
      }
      if (part === 'todos') {
        const res = await fetchTodosOutcome()
        if (!res.ok) {
          noteSlice(part, res.failure)
          return false
        }
        noteSlice(part, null)
        sliceReady.current.todos = true
        update((d) => {
          d.todos = res.data.todos
          return d
        })
        return true
      }
      if (part === 'catalog') {
        const res = await fetchCatalogOutcome()
        if (!res.ok) {
          noteSlice(part, res.failure)
          return false
        }
        noteSlice(part, null)
        sliceReady.current.catalog = true
        update((d) => {
          d.catalog = res.data.catalog
          return d
        })
        return true
      }
      if (part === 'pending') {
        const res = await fetchPendingUsersOutcome('pending')
        if (!res.ok) {
          noteSlice(part, res.failure)
          return false
        }
        noteSlice(part, null)
        update((d) => {
          d.pendingUsers = res.data.pending
          return d
        })
        return true
      }
      const res = await fetchPendingTransactionsOutcome()
      if (!res.ok) {
        noteSlice(part, res.failure)
        return false
      }
      noteSlice(part, null)
      update((d) => {
        d.pendingTransactions = res.data.transactions
        return d
      })
      return true
    })()
    sliceJobs.current.set(part, job)
    void job.then((ok) => {
      if (!ok) sliceJobs.current.delete(part)
    })
    return job
  }, [uiMocks, update, noteSlice])

  /** Loaded slices stay cached for the session; a refresh drops that and fetches again. */
  const reloadSlice = useCallback(
    (part: ServerSlice) => {
      sliceJobs.current.delete(part)
      return loadSlice(part)
    },
    [loadSlice],
  )

  useEffect(() => {
    if (uiMocks || offline) return
    void retryLive()
    // Initial hydrate only — retryLive is exposed for the offline banner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiMocks])

  const visible = useMemo(() => projectDb(db), [db])
  const currentUser = useMemo(
    () => db.users.find((u) => u.id === db.currentUserId) ?? null,
    [db],
  )
  const signedIn = Boolean(currentUser && currentUser.role !== 'guest')
  // Kept current every render so a later loadSlice('users') reads the right role without re-creating the callback.
  isAdminRef.current = currentUser?.role === 'admin'
  const liveWritable = !uiMocks && !offline && liveStatus === 'up'

  const api: StoreApi = {
    db: visible,
    fullDb: db,
    currentUser,
    signedIn,
    liveStatus,
    liveFailure,
    sliceFailures,
    liveWritable,
    plantxEnv: runtimeEnv,
    plantxEnvLabel: runtimeEnvLabel,
    plantxSeed: runtimeSeed,
    liveMeta,
    loadSlice,
    reloadSlice,
    retryLive: () => retryLive(),
    setLocale: (locale) => {
      if (!supportedLocales().includes(locale)) return
      update((d) => ({ ...d, locale }))
    },
    setGreenhousePlace: (areaId) => {
      const area = areaById(areaId)
      if (!area) return
      update((d) => {
        const user = d.users.find((item) => item.id === d.currentUserId && item.role !== 'guest')
        if (!user) return d
        user.region = area.region
        user.regionHe = area.regionHe
        user.lat = area.lat
        user.lng = area.lng
        return d
      })
    },
    setAccount: async (patch) => {
      const ownerId = db.currentUserId
      const before = db.users.find((item) => item.id === ownerId && item.role !== 'guest')
      if (!before) return false
      const prevNickname = before.nickname
      const prevIcon = before.avatarIcon
      update((d) => {
        const user = d.users.find((item) => item.id === ownerId && item.role !== 'guest')
        if (!user) return d
        if (patch.nickname !== undefined) {
          const nickname = cleanNickname(patch.nickname)
          if (nickname) user.nickname = nickname
          else delete user.nickname
        }
        if (patch.avatarIcon) user.avatarIcon = patch.avatarIcon
        return d
      })
      if (!liveWritable) return true
      const saved = await patchAccount(patch)
      if (!saved) {
        update((d) => {
          const user = d.users.find((item) => item.id === ownerId)
          if (!user) return d
          if (prevNickname) user.nickname = prevNickname
          else delete user.nickname
          if (prevIcon) user.avatarIcon = prevIcon
          else delete user.avatarIcon
          return d
        })
        return false
      }
      update((d) => {
        const index = d.users.findIndex((item) => item.id === saved.user.id)
        if (index >= 0) d.users[index] = { ...d.users[index], ...saved.user }
        return d
      })
      return true
    },
    setDemoScenarios: (patch) =>
      update((d) => ({
        ...d,
        flags: { ...normalizeScenarios(d.flags), ...patch },
      })),
    systemPending,
    setAppLaunched: (launched) => {
      void saveSystem('app', { ...db.system, launched })
    },
    setPageStatus: (pageId, status) => {
      void saveSystem(`page:${pageId}`, { ...db.system, pages: { ...db.system.pages, [pageId]: status } })
    },
    setFeatureEnabled: (featureId, enabled) => {
      void saveSystem(`feature:${featureId}`, {
        ...db.system,
        features: {
          ...db.system.features,
          [featureId]: { ...db.system.features[featureId], enabled },
        },
      })
    },
    setFeatureStatus: (featureId, status) => {
      void saveSystem(`feature:${featureId}:status`, {
        ...db.system,
        features: {
          ...db.system.features,
          [featureId]: { ...db.system.features[featureId], status },
        },
      })
    },
    setPlacementEnabled: (placement, enabled) => {
      const item = PLACEMENTS.find((entry) => entry.id === placement)
      if (item?.required && !enabled) return
      void saveSystem(`placement:${placement}`, {
        ...db.system,
        placements: { ...db.system.placements, [placement]: { enabled } },
      })
    },
    loginAs: (userId) => {
      update((d) => ({
        ...d,
        currentUserId: userId,
        flags: personaFlags(userId),
      }))
      if (!liveWritable) return
      void postSession({ userId }).then((live) => {
        if (live) {
          applyLive(live)
          setLiveStatus('up')
        }
      })
    },
    loginByEmail: async (email) => {
      const trimmed = email.trim()
      if (!trimmed.includes('@')) return false

      const live = await postSession({ email: trimmed })
      if (live) {
        applyLive(live)
        setLiveStatus('up')
        return true
      }

      const user = db.users.find(
        (u) =>
          u.role !== 'guest' &&
          u.email?.toLowerCase() === trimmed.toLowerCase() &&
          (u.accountStatus ?? 'active') === 'active',
      )
      if (!user) return false
      update((d) => ({ ...d, currentUserId: user.id, flags: personaFlags(user.id) }))
      return true
    },
    loginWithMockSso: async () => {
      if (!uiMocks) return { ok: false as const, reason: 'offline' }
      const operator = db.users.find(
        (user) => user.role === 'admin' && user.email?.trim().toLowerCase() === OPERATOR_EMAIL,
      )
      if (!operator) return { ok: false as const, reason: 'unknown' }
      update((d) => ({ ...d, currentUserId: operator.id, flags: personaFlags(operator.id) }))
      return { ok: true as const }
    },
    loginWithGoogle: async (credential) => {
      const result = await postGoogleSessionResult(credential)
      if (!result.ok) return { ok: false as const, reason: result.error }
      applyLive(result.live)
      setLiveStatus('up')
      return { ok: true as const }
    },
    approvePendingUser: async (id) => {
      if (liveWritable) {
        const res = await postApprovePending(id)
        if (!res) return false
        update((d) => {
          d.pendingUsers = d.pendingUsers.map((row) => (row.id === id ? res.pending : row))
          if (!d.users.some((u) => u.id === res.user.id)) d.users.push(res.user)
          return d
        })
        return true
      }
      update((d) => {
        const row = d.pendingUsers.find((item) => item.id === id && item.status === 'pending')
        if (!row) return d
        const user: User = {
          id: `u-${Date.now()}`,
          name: row.name,
          nameHe: row.name,
          email: row.email,
          role: 'grower',
          region: UNKNOWN_AREA.region,
          regionHe: UNKNOWN_AREA.regionHe,
          lat: UNKNOWN_AREA.lat,
          lng: UNKNOWN_AREA.lng,
          bio: 'Approved community grower.',
          bioHe: 'מגדל קהילה מאושר.',
          rating: 0,
          completedOrders: 0,
          verificationRate: 0,
          cancellations: 0,
          specialties: [],
          specialtiesHe: [],
          avatarColor: '#1FA85A',
          friendIds: [],
          accountStatus: 'active',
          preapproved: true,
        }
        row.status = 'approved'
        row.approvedAt = new Date().toISOString()
        row.userId = user.id
        d.users.push(user)
        return d
      })
      return true
    },
    rejectPendingUser: async (id) => {
      if (liveWritable) {
        const res = await postRejectPending(id)
        if (!res) return false
        update((d) => {
          d.pendingUsers = d.pendingUsers.map((row) => (row.id === id ? res.pending : row))
          return d
        })
        return true
      }
      update((d) => {
        const row = d.pendingUsers.find((item) => item.id === id && item.status === 'pending')
        if (!row) return d
        row.status = 'rejected'
        row.rejectedAt = new Date().toISOString()
        return d
      })
      return true
    },
    disableUser: async (id) => {
      if (liveWritable) {
        const res = await postDisableUser(id)
        if (!res) return false
        update((d) => {
          const user = d.users.find((item) => item.id === id)
          if (user) user.accountStatus = 'disabled'
          if (d.currentUserId === id) d.currentUserId = null
          return d
        })
        return true
      }
      update((d) => {
        const user = d.users.find((item) => item.id === id)
        if (!user || user.role === 'admin') return d
        user.accountStatus = 'disabled'
        if (d.currentUserId === id) d.currentUserId = null
        return d
      })
      return true
    },
    enableUser: async (id) => {
      if (liveWritable) {
        const res = await postEnableUser(id)
        if (!res) return false
        update((d) => {
          const user = d.users.find((item) => item.id === id)
          if (user) user.accountStatus = 'active'
          return d
        })
        return true
      }
      update((d) => {
        const user = d.users.find((item) => item.id === id)
        if (user) user.accountStatus = 'active'
        return d
      })
      return true
    },
    setPreapproved: async (id, preapproved) => {
      if (liveWritable) {
        const res = await postPreapproved(id, preapproved)
        if (!res) return false
        update((d) => {
          const user = d.users.find((item) => item.id === id)
          if (user) user.preapproved = Boolean(res.user.preapproved)
          return d
        })
        return true
      }
      update((d) => {
        const user = d.users.find((item) => item.id === id)
        if (!user || user.role === 'admin') return d
        if ((user.accountStatus ?? 'active') === 'disabled' && preapproved) return d
        user.preapproved = preapproved
        return d
      })
      return true
    },
    refreshAccessQueue: async (part) => {
      if (part === 'pending') {
        const pending = await fetchPendingUsers('pending')
        if (!pending) return
        update((d) => {
          d.pendingUsers = pending.pending
          return d
        })
        return
      }
      const transactions = await fetchPendingTransactions()
      if (!transactions) return
      update((d) => {
        d.pendingTransactions = transactions.transactions
        return d
      })
    },
    resetDemo: () => setDb(ensureSession(createSeed())),
    createListing: (input) => {
      const target = db.plants.find((p) => p.id === input.plantId)
      if (!target || !db.currentUserId) return { ok: false, reason: 'unavailable' }
      const blocker = publishBlocker(target, normalizeScenarios(db.flags).publishRequirement)
      if (blocker) return { ok: false, reason: blocker }
      const id = `ls-${Date.now()}`
      update((d) => {
        const plant = d.plants.find((p) => p.id === input.plantId)
        if (!plant || !d.currentUserId) return d
        const seller = d.users.find((u) => u.id === d.currentUserId)
        const area = resolveArea(plant.locationZone)
        plant.status = 'listed'
        plant.publishedAt ??= new Date().toISOString()
        d.listings.unshift({
          id,
          plantId: input.plantId,
          sellerId: d.currentUserId,
          price: input.price,
          quantity: input.quantity,
          unit: input.unit,
          pickupOnly: true,
          allowOffers: input.allowOffers,
          status: 'active',
          createdAt: new Date().toISOString().slice(0, 10),
          region: area?.region ?? seller?.region ?? '',
          regionHe: plant.locationZoneHe || area?.regionHe || seller?.regionHe || '',
        })
        return d
      })
      return { ok: true, id }
    },
    gradePlant: (plantId, letter) =>
      update((d) => {
        const plant = d.plants.find((p) => p.id === plantId)
        const grader = actorId(d) ?? d.visitorId
        if (!plant || plant.ownerId === grader) return d
        plant.grades = (plant.grades ?? []).filter((grade) => grade.graderId !== grader)
        plant.grades.push({ letter, at: new Date().toISOString(), graderId: grader })
        return d
      }),
    ungradePlant: (plantId) =>
      update((d) => {
        const plant = d.plants.find((p) => p.id === plantId)
        const grader = actorId(d) ?? d.visitorId
        if (!plant?.grades) return d
        plant.grades = plant.grades.filter((grade) => grade.graderId !== grader)
        return d
      }),
    refreshPhoto: (plantId) => {
      if (!liveWritable) return
      const owner = actorId(db) ?? db.visitorId
      const open = openTodo(db.todos ?? [], plantId, 'photo')
      if (open && open.ownerId === owner) {
        api.completeTodo(open.id)
      }
    },
    confirmWater: (plantId) => {
      if (!liveWritable) return
      const owner = actorId(db) ?? db.visitorId
      const open = openTodo(db.todos ?? [], plantId, 'water')
      if (!open || open.ownerId !== owner) return
      if (isFirstWaterTodo(open, db.todos ?? [])) {
        api.completeTodo(open.id, todayIso())
        return
      }
      api.completeTodo(open.id)
    },
    completeTodo: (todoId, completedOn) => {
      if (!liveWritable) return
      update((d) => {
        const owner = actorId(d) ?? d.visitorId
        const todos = d.todos ?? []
        const todo = todos.find((row) => row.id === todoId)
        if (!todo || todo.ownerId !== owner || todo.completedOn != null) return d
        const plant = d.plants.find((item) => item.id === todo.plantId && item.ownerId === owner)
        if (!plant) return d
        const firstWater = isFirstWaterTodo(todo, todos)
        const at = completedOn ?? todayIso()
        const window = careFillWindow(todo.subcategory, todayIso())
        if (at < window.min || at > window.max) return d
        if (firstWater && !completedOn) return d
        if (firstWater && completedOn && completedOn > todayIso()) return d
        if (!firstWater && (todo.dueOn == null || todo.dueOn > todayIso())) return d

        todo.completedOn = at
        if (todo.dueOn == null) todo.dueOn = at
        // Outside the update: the store has no i18n, the toast builds the text.
        const care = todo.subcategory === 'photo' ? 'photo' : 'water'
        queueMicrotask(() => notifyCareDone(todo.id, care, CARE_XP))

        if (todo.subcategory === 'water') {
          plant.history = [{ at, label: 'Watered', labelHe: 'הושקה' }, ...plant.history]
          d.updates = d.updates ?? []
          d.updates.unshift({
            id: `up-water-${Date.now()}`,
            kind: 'water',
            userId: owner,
            plantId: plant.id,
            body: `Water confirmed on ${plant.title}.`,
            bodyHe: `השקיה אושרה ל־${plant.titleHe}.`,
            createdAt: new Date().toISOString(),
          })
          todos.unshift({
            id: `todo-${Date.now()}-w`,
            ownerId: owner,
            plantId: plant.id,
            category: 'plant',
            subcategory: 'water',
            dueOn: addDays(at, WATER_GAP_DAYS),
            completedOn: null,
            createdAt: new Date().toISOString(),
          })
        }

        if (todo.subcategory === 'photo') {
          plant.history = [{ at, label: 'Photo refreshed', labelHe: 'התמונה רועננה' }, ...plant.history]
          d.updates = d.updates ?? []
          d.updates.unshift({
            id: `up-photo-${Date.now()}`,
            kind: 'photo',
            userId: owner,
            plantId: plant.id,
            body: `${plant.title} photo refreshed.`,
            bodyHe: `תמונת ${plant.titleHe} רועננה.`,
            createdAt: new Date().toISOString(),
          })
          todos.unshift({
            id: `todo-${Date.now()}-p`,
            ownerId: owner,
            plantId: plant.id,
            category: 'plant',
            subcategory: 'photo',
            dueOn: addMonths(at, PHOTO_GAP_MONTHS),
            completedOn: null,
            createdAt: new Date().toISOString(),
          })
        }

        d.todos = todos
        return d
      })
      void postTodoComplete(todoId, completedOn).then((res) => {
        if (!res) return
        update((d) => {
          const index = d.plants.findIndex((item) => item.id === res.plant.id)
          if (index >= 0) d.plants[index] = res.plant
          d.todos = res.todos
          d.updates = res.updates
          return d
        })
      })
    },
    addGreenhousePlant: (input) => {
      const signedNow = db.users.find((user) => user.id === db.currentUserId && user.role !== 'guest')
      if (!signedNow) return ''
      const area = resolveArea(input.location.region)
      if (!area || !Number.isFinite(input.location.lat) || !Number.isFinite(input.location.lng)) return ''
      const id = `pl-${Date.now()}`
      const place = {
        region: area.region,
        regionHe: input.location.regionHe || area.regionHe,
        lat: input.location.lat,
        lng: input.location.lng,
      }
      let created: MockDb['plants'][number] | null = null
      update((d) => {
        const signed = d.users.find((u) => u.id === d.currentUserId && u.role !== 'guest')
        const ownerId = signed?.id ?? d.visitorId
        if (signed && !resolveArea(signed.region)) {
          signed.region = place.region
          signed.regionHe = place.regionHe
          signed.lat = place.lat
          signed.lng = place.lng
        }
        const species =
          d.species.find((item) => item.id === input.speciesId) ??
          d.species.find((item) => item.ticker && input.code.startsWith(item.ticker))
        const marketClassId =
          input.marketClassId ?? d.marketClasses.find((item) => item.code === input.code)?.id
        created = {
          id,
          code: input.code,
          ownerId,
          speciesId: species?.id ?? input.speciesId,
          marketClassId,
          variety: input.variety,
          varietyHe: input.varietyHe,
          subcategoryId: input.subcategoryId,
          traits: input.traits,
          title: input.title.trim(),
          titleHe: input.titleHe.trim(),
          description: input.description.trim(),
          descriptionHe: input.descriptionHe.trim(),
          photos: plantPhotos(input.photos),
          quantity: 1,
          sizeGrade: input.sizeBand,
          sizeBand: input.sizeBand,
          quality: input.quality,
          stage: input.stage,
          rooting: input.stage === 'CUT' ? 'unrooted' : input.stage === 'ROOTED' ? 'rooted' : 'established',
          ...fieldsFromPlace(place),
          status: 'owned',
          identification: input.identification,
          createdAt: new Date().toISOString().slice(0, 10),
          history: [
            {
              at: new Date().toISOString().slice(0, 10),
              label: 'Added to greenhouse',
              labelHe: 'נוסף לחממה',
            },
          ],
        }
        d.plants.unshift(created)
        d.todos = ensureFirstWaterTodo(d.todos ?? [], created)
        if (created.photos.length > 0) d.todos = schedulePhotoTodo(d.todos, created)
        return d
      })
      if (created && liveWritable) {
        void postPlant(created, input.identifyRequestIds).then((res) => {
          if (!res) return
          update((d) => {
            const index = d.plants.findIndex((item) => item.id === res.plant.id)
            if (index >= 0) d.plants[index] = res.plant
            else d.plants.unshift(res.plant)
            if (res.updates) d.updates = res.updates
            if (res.todos) d.todos = res.todos
            return d
          })
        })
      }
      return id
    },
    noteActivity: (next) =>
      update((d) => {
        d.updates = [next, ...(d.updates ?? []).filter((item) => item.id !== next.id)]
        return d
      }),
    commitCatalog: (fn) => {
      update((d) => {
        d.catalog ??= createCatalog()
        const result = fn({
          catalog: structuredClone(d.catalog),
          species: structuredClone(d.species),
        })
        d.catalog = result.catalog
        if (result.species) d.species = result.species
        void saveCatalogFile(d.catalog)
        return d
      })
    },
    purchaseClass: (marketClassId) => {
      const listing = db.listings.find(
        (l) =>
          l.status === 'active' &&
          (l.marketClassId === marketClassId ||
            db.plants.some((p) => p.id === l.plantId && p.marketClassId === marketClassId)),
      )
      if (!listing) return null
      const orderId = `or-${Date.now()}`
      update((d) => {
        if (!d.currentUserId || d.users.find((u) => u.id === d.currentUserId)?.role === 'guest') return d
        const row = d.listings.find((l) => l.id === listing.id)
        if (!row || row.status !== 'active') return d
        row.status = 'reserved'
        const plant = d.plants.find((p) => p.id === row.plantId)
        d.orders.unshift({
          id: orderId,
          buyerId: d.currentUserId,
          sellerIds: [row.sellerId],
          listingId: row.id,
          items: [
            {
              plantId: row.plantId,
              title: plant?.title ?? 'Plant',
              titleHe: plant?.titleHe ?? 'צמח',
              qty: 1,
              unitPrice: row.price,
              photo: plant?.photos[0] ?? '',
            },
          ],
          total: row.price,
          status: 'intent',
          createdAt: new Date().toISOString().slice(0, 10),
          deliveryPlace: row.region,
          deliveryPlaceHe: row.regionHe,
        })
        return d
      })
      return orderId
    },
    createPlantBatch: (input) => {
      const area = resolveArea(input.location.region)
      if (!area || !Number.isFinite(input.location.lat) || !Number.isFinite(input.location.lng)) return ''
      const id = `pl-${Date.now()}`
      const place = {
        region: area.region,
        regionHe: input.location.regionHe || area.regionHe,
        lat: input.location.lat,
        lng: input.location.lng,
      }
      update((d) => {
        if (!d.currentUserId) return d
        const user = d.users.find((u) => u.id === d.currentUserId)
        if (user && !resolveArea(user.region)) {
          user.region = place.region
          user.regionHe = place.regionHe
          user.lat = place.lat
          user.lng = place.lng
        }
        d.plants.unshift({
          id,
          code: `BT-${Math.floor(Math.random() * 90000 + 10000)}`,
          ownerId: d.currentUserId,
          speciesId: input.speciesId,
          title: input.title,
          titleHe: input.titleHe,
          photos: [
            input.photo ?? defaultPlantPhoto,
          ],
          quantity: input.quantity,
          sizeGrade: 'cutting',
          quality: input.quality,
          rooting: input.rooting,
          ...fieldsFromPlace(place),
          parentId: input.parentId,
          propagatedAt: new Date().toISOString().slice(0, 10),
          status: 'owned',
          createdAt: new Date().toISOString().slice(0, 10),
          history: [
            {
              at: new Date().toISOString().slice(0, 10),
              label: 'Created in greenhouse',
              labelHe: 'נוצר בחממה',
            },
          ],
        })
        return d
      })
      return id
    },
    makeOffer: (input) =>
      update((d) => {
        if (!d.currentUserId) return d
        const listing = d.listings.find((l) => l.id === input.listingId)
        if (!listing) return d
        d.offers.unshift({
          id: `of-${Date.now()}`,
          listingId: input.listingId,
          fromUserId: d.currentUserId,
          toUserId: listing.sellerId,
          amount: input.amount,
          message: input.message,
          messageHe: input.messageHe,
          status: 'open',
          createdAt: new Date().toISOString().slice(0, 10),
        })
        return d
      }),
    setOfferStatus: (id, status) =>
      update((d) => {
        const o = d.offers.find((x) => x.id === id)
        if (o) o.status = status
        return d
      }),
    completeHandoff: (orderId) =>
      update((d) => {
        const order = d.orders.find((o) => o.id === orderId)
        if (!order) return d
        order.status = 'completed'
        order.completedAt = new Date().toISOString().slice(0, 10)
        if (order.listingId) {
          const listing = d.listings.find((l) => l.id === order.listingId)
          if (listing) listing.status = 'sold'
        }
        return d
      }),
    resolveModeration: (id, status) =>
      update((d) => {
        const m = d.moderation.find((x) => x.id === id)
        if (m) m.status = status
        return d
      }),
    claimDraft: (draftId) =>
      update((d) => {
        if (!d.currentUserId || d.currentUserId === 'u-guest') return d
        const draft = d.claimDrafts.find((x) => x.id === draftId)
        if (!draft || draft.claimedBy) return d
        const area = resolveArea(draft.region)
        if (!area) return d
        draft.claimedBy = d.currentUserId
        const plantId = `pl-claimed-${Date.now()}`
        d.plants.unshift({
          id: plantId,
          code: `CL-${Math.floor(Math.random() * 9000 + 1000)}`,
          ownerId: d.currentUserId,
          speciesId: draft.speciesId,
          title: draft.title,
          titleHe: draft.titleHe,
          photos: [draft.photo],
          quantity: draft.quantity,
          sizeGrade: 'claimed',
          quality: 'B',
          rooting: 'established',
          ...fieldsFromPlace({
            region: area.region,
            regionHe: draft.regionHe || area.regionHe,
            lat: area.lat,
            lng: area.lng,
          }),
          status: 'listed',
          createdAt: new Date().toISOString().slice(0, 10),
          history: [
            {
              at: new Date().toISOString().slice(0, 10),
              label: 'Claimed draft & published',
              labelHe: 'טיוטה נתבעה ופורסמה',
            },
          ],
        })
        d.listings.unshift({
          id: `ls-claimed-${Date.now()}`,
          plantId,
          sellerId: d.currentUserId,
          price: draft.price,
          quantity: draft.quantity,
          unit: 'plant',
          pickupOnly: true,
          allowOffers: true,
          status: 'active',
          createdAt: new Date().toISOString().slice(0, 10),
          region: draft.region,
          regionHe: draft.regionHe,
        })
        const mod = d.moderation.find((m) => m.targetId === draftId)
        if (mod) mod.status = 'resolved'
        return d
      }),
    reserveListing: (listingId) => {
      const orderId = `or-${Date.now()}`
      update((d) => {
        if (!d.currentUserId) return d
        const listing = d.listings.find((l) => l.id === listingId)
        if (!listing) return d
        listing.status = 'reserved'
        const plant = d.plants.find((p) => p.id === listing.plantId)
        d.orders.unshift({
          id: orderId,
          buyerId: d.currentUserId,
          sellerIds: [listing.sellerId],
          listingId,
          items: [
            {
              plantId: listing.plantId,
              title: plant?.title ?? 'Plant',
              titleHe: plant?.titleHe ?? 'צמח',
              qty: listing.quantity,
              unitPrice: listing.price,
              photo: plant?.photos[0] ?? '',
            },
          ],
          total: listing.price * (listing.unit === 'bundle' ? 1 : Math.min(listing.quantity, 1)),
          status: 'intent',
          createdAt: new Date().toISOString().slice(0, 10),
          deliveryPlace: listing.region,
          deliveryPlaceHe: listing.regionHe,
        })
        return d
      })
      return orderId
    },
    setFeedFriendsOnly: (value) => update((d) => ({ ...d, feedFriendsOnly: value })),
    setVerifiedGreenhouses: (ids) => update((d) => ({ ...d, verifiedGreenhouseIds: ids.slice(0, 3) })),
    sendMessage: (threadId, body, bodyHe) =>
      update((d) => {
        if (!d.currentUserId) return d
        const thread = d.threads.find((t) => t.id === threadId)
        if (!thread) return d
        thread.messages.push({
          id: `m-${Date.now()}`,
          fromUserId: d.currentUserId,
          body,
          bodyHe,
          at: new Date().toISOString(),
        })
        return d
      }),
  }

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
