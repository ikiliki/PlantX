import type {
  Catalog,
  CatalogSuggestion,
  CatalogSuggestionDraft,
  IdentifyFieldChecks,
  IdentifyMode,
  IdentifyProviderId,
  IdentifyProviderSettings,
  IdentifyRequestRecord,
  Plant,
  User,
} from '../../../src/mock/types.ts'
import type { SystemConfig } from '../../../src/theme/release.ts'
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
  }
  pendingUsers: {
    list(): Promise<PendingUser[]>
    saveAll(rows: PendingUser[]): Promise<void>
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
  }
  activities: {
    list(): Promise<Activity[]>
    saveAll(rows: Activity[]): Promise<void>
  }
  todos: {
    list(): Promise<Todo[]>
    saveAll(rows: Todo[]): Promise<void>
  }
  catalog: {
    get(): Promise<Catalog>
    save(catalog: Catalog): Promise<void>
  }
  /** Identify hits that matched no category. Hidden from the grower. */
  catalogSuggestions: {
    list(status?: CatalogSuggestion['status'] | 'all'): Promise<CatalogSuggestion[]>
    suggest(input: {
      name: string
      scientificName: string
      genus: string
      commonNames: string[]
      provider: string
      draft: CatalogSuggestionDraft
    }): Promise<void>
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
  identifySettings: {
    /** Saved admin switches. A provider without a row is enabled and ready. */
    get(): Promise<Partial<Record<IdentifyProviderId, IdentifyProviderSettings>>>
    save(id: IdentifyProviderId, patch: Partial<IdentifyProviderSettings>): Promise<void>
  }
}
