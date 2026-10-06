import type { TermsConsent, User } from '../../../../src/mock/types.ts'

/** Landing applications waiting for an admin to preview and activate. */
export type PendingUserStatus = 'pending' | 'approved' | 'rejected'

export interface PendingUser extends TermsConsent {
  id: string
  name: string
  email: string
  note?: string
  createdAt: string
  status: PendingUserStatus
  approvedAt?: string
  rejectedAt?: string
  /** Set when activated into the users table. */
  userId?: string
}

/** Placeholder for future trade holds. */
export type PendingTransactionStatus = 'pending' | 'released' | 'cancelled'

export interface PendingTransaction {
  id: string
  kind: 'purchase' | 'listing' | 'transfer'
  userId: string
  label: string
  labelHe: string
  amount?: number
  createdAt: string
  status: PendingTransactionStatus
}

export type AccountStatus = 'active' | 'disabled'

export type ManagedUser = User & {
  accountStatus: AccountStatus
}

export function withAccountStatus(user: User): ManagedUser {
  return {
    ...user,
    accountStatus: (user as ManagedUser).accountStatus ?? 'active',
  }
}
