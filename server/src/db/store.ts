import type {
  Catalog,
  IdentifyFieldChecks,
  IdentifyMode,
  IdentifyProviderId,
  IdentifyRequestRecord,
  Plant,
  User,
} from '../../../src/mock/types.ts'
import type { SystemConfig } from '../../../src/theme/release.ts'
import type { Activity } from '../features/activity/activity.types.ts'
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
  catalog: {
    get(): Promise<Catalog>
    save(catalog: Catalog): Promise<void>
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
    /** Saved admin switches. A provider without a row is enabled. */
    get(): Promise<Partial<Record<IdentifyProviderId, boolean>>>
    save(id: IdentifyProviderId, enabled: boolean): Promise<void>
  }
}
