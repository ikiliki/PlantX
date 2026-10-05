import type {
  Catalog,
  CatalogSuggestion,
  CatalogSuggestionDraft,
  IdentifyFieldChecks,
  IdentifyMode,
  IdentifyProviderId,
  IdentifyProviderSettings,
  IdentifyRequestRecord,
  ModerationEntry,
  ModerationTarget,
  Plant,
  ScanAdjustment,
  User,
  Visibility,
} from '../../../src/mock/types.ts'
import type { SystemConfig } from '../../../src/theme/release.ts'
import type { IssueContext, IssueReport } from '../../../src/lib/issueReport.ts'
import type { Activity } from '../features/activity/activity.types.ts'
import type { Todo } from '../features/todo/todo.types.ts'
import type { PendingTransaction, PendingUser } from '../features/users/users.types.ts'

/**
 * Persistence port. Services talk only to this.
 * The driver writes normalized Supabase tables.
 * A replacement database implements this same interface.
 */
export interface PlantxStore {
  readonly driver: 'supabase'
  /** True once this environment has been seeded. */
  isReady(): Promise<boolean>
  users: {
    list(): Promise<User[]>
    saveAll(users: User[]): Promise<void>
    /** Insert or update only these rows. Never deletes. */
    upsert(users: User[]): Promise<void>
  }
  pendingUsers: {
    list(): Promise<PendingUser[]>
    saveAll(rows: PendingUser[]): Promise<void>
    upsert(rows: PendingUser[]): Promise<void>
  }
  pendingTransactions: {
    list(): Promise<PendingTransaction[]>
    saveAll(rows: PendingTransaction[]): Promise<void>
  }
  plants: {
    list(): Promise<Plant[]>
    /** Row count only. Live status must not load photo blobs just to count them. */
    count(): Promise<number>
    saveAll(plants: Plant[]): Promise<void>
    upsert(plants: Plant[]): Promise<void>
  }
  activities: {
    list(): Promise<Activity[]>
    saveAll(rows: Activity[]): Promise<void>
    upsert(rows: Activity[]): Promise<void>
  }
  todos: {
    list(): Promise<Todo[]>
    saveAll(rows: Todo[]): Promise<void>
    upsert(rows: Todo[]): Promise<void>
  }
  catalog: {
    get(): Promise<Catalog>
    save(catalog: Catalog): Promise<void>
  }
  /** Plants the catalog lacks: identify hits that matched no category, and members' suggestions. */
  catalogSuggestions: {
    list(status?: CatalogSuggestion['status'] | 'all'): Promise<CatalogSuggestion[]>
    /** Open rows this user suggested. */
    listFor(userId: string): Promise<CatalogSuggestion[]>
    /** Files a row, or joins an open row for the same plant (one more hit, one more suggester). */
    suggest(input: {
      name: string
      scientificName: string
      genus: string
      commonNames: string[]
      provider: string
      draft: CatalogSuggestionDraft
      origin: CatalogSuggestion['origin']
      userId?: string
      note?: string
    }): Promise<CatalogSuggestion | null>
    /** Replace an open row's draft (the AI draft arrives after the row is filed). */
    setDraft(id: string, draft: CatalogSuggestionDraft): Promise<void>
    dismiss(id: string): Promise<void>
    /** The suggestion was saved into the catalog. */
    accept(id: string): Promise<void>
  }
  system: {
    get(): Promise<Partial<SystemConfig> | null>
    save(system: SystemConfig): Promise<void>
  }
  identifyRequests: {
    /** Newest first. `userName` is filled from users. */
    list(query: { mode?: IdentifyMode; limit: number }): Promise<IdentifyRequestRecord[]>
    get(id: string): Promise<IdentifyRequestRecord | null>
    add(record: IdentifyRequestRecord): Promise<void>
    /** Marks a request as added with this plant and photo. */
    link(id: string, link: { plantId: string; photoIndex: number; fields?: IdentifyFieldChecks }): Promise<void>
  }
  /** Grower reports of HTTP 500s and page crashes. */
  issueReports: {
    list(): Promise<IssueReport[]>
    add(input: { userId: string | null; note: string; context: IssueContext }): Promise<IssueReport>
    setStatus(id: string, status: 'resolved' | 'dismissed'): Promise<void>
  }
  /** AI scan quota (#67). Usage is counted from identify_requests. */
  scanQuota: {
    /** Add Plant scans by this user since `sinceIso`. */
    countAddPlant(userId: string, sinceIso: string): Promise<number>
    /** Admin changes for one user, newest first; `day` narrows to one day. */
    adjustments(userId: string, day?: string): Promise<ScanAdjustment[]>
    /** Sum of today's extra scans per user. */
    extrasByUser(day: string): Promise<Record<string, number>>
    /** Add Plant scans per user since `sinceIso`. */
    usedByUser(sinceIso: string): Promise<Record<string, number>>
    add(item: ScanAdjustment): Promise<void>
    setLimit(userId: string, limit: number | null): Promise<void>
  }
  /** Abuse limits (#57): fixed-window counters. */
  rateLimits: {
    /** Counts one hit and returns the window's total. */
    hit(key: string, windowStart: string): Promise<number>
    prune(beforeIso: string): Promise<void>
  }
  /** Hide / show / soft delete (#68) and the audit log (#69). Saves never write these columns. */
  moderation: {
    setVisibility(
      type: ModerationTarget,
      id: string,
      change: { visibility: Visibility; by: string; reason: string },
    ): Promise<void>
    log(entry: ModerationEntry): Promise<void>
    list(limit: number): Promise<ModerationEntry[]>
  }
  identifySettings: {
    /** Saved admin switches. A provider without a row is enabled and ready. */
    get(): Promise<Partial<Record<IdentifyProviderId, IdentifyProviderSettings>>>
    save(id: IdentifyProviderId, patch: Partial<IdentifyProviderSettings>): Promise<void>
  }
}
