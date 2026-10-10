/**
 * System release config is editable in Admin → System.
 * A page is a container. A feature owns the status. Each component is shown or hidden.
 * Do not encode faces as TypeScript interfaces — status lives in the mock store.
 */
import { defaultAppLaunched } from './launch'

export const FEATURE_IDS = ['greenhouse', 'market', 'rank', 'wiki', 'news', 'todo'] as const
export type FeatureId = (typeof FEATURE_IDS)[number]

export const PAGE_IDS = ['home', 'feed', 'market', 'greenhouse', 'todo', 'rank', 'wiki'] as const
export type PageId = (typeof PAGE_IDS)[number]

/** Shown only while the placement is enabled. */
export type ReleaseMode = 'ready' | 'comingSoon' | 'maintenance'

/** A feature is off, or on in one of the three release modes. */
export interface PlacementConfig {
  enabled: boolean
  status: ReleaseMode
}

/** Phone is under 900px of the window, desktop is 900px and up. */
export type DeviceId = 'phone' | 'desktop'

/** A component is shown or hidden, and per device. Its status comes from the feature. */
export interface ComponentConfig {
  enabled: boolean
  phone: boolean
  desktop: boolean
}

/** Page: live, or under maintenance (stopped showing). */
export type PageStatus = 'live' | 'maintenance'

export const PLACEMENTS = [
  { id: 'home.feed', pageId: 'home', featureId: 'news', required: true },
  { id: 'feed.board', pageId: 'feed', featureId: 'news', required: true },
  /** 🌿 reactions and comments on Feed posts (and their counts on Home). */
  { id: 'feed.social', pageId: 'feed', featureId: 'news', required: false },
  { id: 'home.market', pageId: 'home', featureId: 'market', required: false },
  { id: 'home.rank', pageId: 'home', featureId: 'rank', required: false },
  { id: 'home.wiki', pageId: 'home', featureId: 'wiki', required: false },
  { id: 'home.todo', pageId: 'home', featureId: 'todo', required: true },
  /** The daily Home (greeting, care, greenhouse, top greenhouses, short rows); off gives the columns with the feed. */
  { id: 'home.today', pageId: 'home', featureId: 'news', required: false },
  { id: 'market.board', pageId: 'market', featureId: 'market', required: true },
  { id: 'market.class', pageId: 'market', featureId: 'market', required: true },
  { id: 'market.categories', pageId: 'market', featureId: 'market', required: true },
  { id: 'market.category', pageId: 'market', featureId: 'market', required: true },
  { id: 'profile.market.stats', pageId: 'market', featureId: 'market', required: true },
  { id: 'profile.market.trust', pageId: 'market', featureId: 'market', required: true },
  { id: 'greenhouse.board', pageId: 'greenhouse', featureId: 'greenhouse', required: true },
  { id: 'greenhouse.card', pageId: 'greenhouse', featureId: 'greenhouse', required: true },
  { id: 'greenhouse.level', pageId: 'greenhouse', featureId: 'greenhouse', required: false },
  { id: 'todo.board', pageId: 'todo', featureId: 'todo', required: true },
  { id: 'passport.market', pageId: 'greenhouse', featureId: 'market', required: false },
  { id: 'passport.rank', pageId: 'greenhouse', featureId: 'rank', required: false },
  { id: 'passport.todo', pageId: 'greenhouse', featureId: 'todo', required: false },
  { id: 'rank.board', pageId: 'rank', featureId: 'rank', required: true },
  { id: 'wiki.board', pageId: 'wiki', featureId: 'wiki', required: true },
] as const


export type PlacementId = (typeof PLACEMENTS)[number]['id']

/** Visible pieces with no release flag. They stay on; Admin does not edit them. */
export const PLAIN = [
  { id: 'home.lure', pageId: 'home' },
  { id: 'home.top', pageId: 'home' },
  { id: 'market.ticker', pageId: 'market' },
  { id: 'market.search', pageId: 'market' },
  { id: 'market.listings', pageId: 'market' },
  { id: 'market.map', pageId: 'market' },
  { id: 'greenhouse.add', pageId: 'greenhouse' },
] as const

export type PlainId = (typeof PLAIN)[number]['id']

export interface SystemConfig {
  /** Visitors see the app when this is on. Admin still sees it when it is off. */
  launched: boolean
  pages: Record<PageId, PageStatus>
  features: Record<FeatureId, PlacementConfig>
  placements: Record<PlacementId, ComponentConfig>
}

/** Primary feature behind each main app page. */
export const PAGE_FEATURE: Record<PageId, FeatureId> = {
  home: 'news',
  feed: 'news',
  market: 'market',
  greenhouse: 'greenhouse',
  todo: 'todo',
  rank: 'rank',
  wiki: 'wiki',
}

export const DEFAULT_SYSTEM: SystemConfig = {
  launched: defaultAppLaunched(),
  pages: {
    home: 'live',
    feed: 'live',
    market: 'maintenance',
    greenhouse: 'live',
    todo: 'live',
    rank: 'maintenance',
    wiki: 'live',
  },
  features: {
    news: { enabled: true, status: 'ready' },
    market: { enabled: false, status: 'comingSoon' },
    greenhouse: { enabled: true, status: 'ready' },
    todo: { enabled: true, status: 'ready' },
    rank: { enabled: false, status: 'comingSoon' },
    wiki: { enabled: true, status: 'ready' },
  },
  placements: Object.fromEntries(
    PLACEMENTS.map((item) => [item.id, { enabled: true, phone: true, desktop: item.id !== 'home.today' }]),
  ) as Record<PlacementId, ComponentConfig>,
}

function isReleaseMode(value: unknown): value is ReleaseMode {
  return value === 'ready' || value === 'comingSoon' || value === 'maintenance'
}

function readPlacement(value: unknown, fallback: PlacementConfig): PlacementConfig {
  if (value === 'disabled') return { enabled: false, status: fallback.status }
  if (isReleaseMode(value)) return { enabled: true, status: value }
  if (value && typeof value === 'object') {
    const record = value as { enabled?: unknown; status?: unknown }
    return {
      enabled: typeof record.enabled === 'boolean' ? record.enabled : fallback.enabled,
      status: isReleaseMode(record.status) ? record.status : fallback.status,
    }
  }
  return { enabled: fallback.enabled, status: fallback.status }
}

function readComponent(value: unknown, fallback: ComponentConfig): ComponentConfig {
  if (!value || typeof value !== 'object') return { ...fallback }
  const record = value as Partial<Record<keyof ComponentConfig, unknown>>
  const flag = (key: keyof ComponentConfig) => (typeof record[key] === 'boolean' ? (record[key] as boolean) : fallback[key])
  return { enabled: flag('enabled'), phone: flag('phone'), desktop: flag('desktop') }
}

export function normalizeSystem(
  raw: {
    launched?: unknown
    pages?: Partial<Record<PageId, PageStatus>>
    features?: Partial<Record<FeatureId, unknown>>
    placements?: Partial<Record<string, unknown>>
  } | undefined,
): SystemConfig {
  const launched = typeof raw?.launched === 'boolean' ? raw.launched : DEFAULT_SYSTEM.launched
  const pages = { ...DEFAULT_SYSTEM.pages }
  const features = { ...DEFAULT_SYSTEM.features }
  const placements = { ...DEFAULT_SYSTEM.placements }
  if (raw?.pages) {
    for (const id of PAGE_IDS) {
      const value = raw.pages[id]
      if (value === 'live' || value === 'maintenance') pages[id] = value
    }
  }
  for (const id of FEATURE_IDS) {
    features[id] = readPlacement(raw?.features?.[id], DEFAULT_SYSTEM.features[id])
  }
  for (const item of PLACEMENTS) {
    const saved = raw?.placements?.[item.id]
    placements[item.id] = readComponent(saved, DEFAULT_SYSTEM.placements[item.id])
  }
  return { launched, pages, features, placements }
}

/**
 * Status lives on the feature. A shown component follows it. A hidden component stays off unless the feature itself is off, which locks every component.
 * With a device, a component switched off for that device is off there too (required ones included).
 */
export function placementRelease(system: SystemConfig, id: PlacementId, device?: DeviceId): PlacementConfig {
  const featureId = PLACEMENTS.find((item) => item.id === id)?.featureId
  const feature = featureId ? system.features[featureId] : undefined
  const status = feature?.status ?? 'comingSoon'
  if (!feature?.enabled) return { enabled: false, status }
  const item = PLACEMENTS.find((entry) => entry.id === id)
  const config = system.placements[id]
  const enabled = (item?.required ? true : config.enabled) && (!device || config[device])
  return { enabled, status }
}

export function placementsOn(pageId: PageId) {
  return PLACEMENTS.filter((item) => item.pageId === pageId)
}

export function plainOn(pageId: PageId) {
  return PLAIN.filter((item) => item.pageId === pageId)
}

export function isPlacementEnabled(system: SystemConfig, id: PlacementId, device?: DeviceId): boolean {
  return placementRelease(system, id, device).enabled
}

export function isPlacementReady(system: SystemConfig, id: PlacementId): boolean {
  const placement = placementRelease(system, id)
  return placement.enabled && placement.status === 'ready'
}

/** Feature switch only — used by routes that have no page status (todo). */
export function isFeatureEnabled(system: SystemConfig, id: FeatureId): boolean {
  return Boolean(system.features[id]?.enabled)
}

export function isFeatureReady(system: SystemConfig, id: FeatureId): boolean {
  const feature = system.features[id]
  return Boolean(feature?.enabled && feature.status === 'ready')
}

/** Nav shows the page when the page is live. Component status gates that component, not the link. */
export function isPageNavigable(system: SystemConfig, pageId: PageId): boolean {
  return system.pages[pageId] !== 'maintenance'
}
