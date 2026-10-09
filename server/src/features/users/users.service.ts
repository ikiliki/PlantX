import { analyticsService } from '../analytics/analytics.service.ts'
import { generateNickname } from '../../../../src/features/profile/avatarIcons.ts'
import { UNKNOWN_AREA } from '../../../../src/mock/locations.ts'
import type { TermsConsent, User } from '../../../../src/mock/types.ts'
import { greenhouseLevel } from '../../../../src/features/greenhouse/greenhouseLevel.ts'
import { sharedGrowerName } from '../../../../src/features/profile/avatarIcons.ts'
import { getStore } from '../../db/index.ts'
import { Errors } from '../../lib/errors.ts'
import { canSee, stateOf, visibilityIndex, visiblePlants, visibleUsers } from '../../lib/visibility.ts'
import { notifyApproved, notifySignUp } from '../../lib/events.ts'
import {
  type AccountStatus,
  type ManagedUser,
  type PendingUser,
  withAccountStatus,
} from './users.types.ts'

/**
 * What other members get about a grower (#88): no email, no admin flags, scan overrides or consent record.
 * The account name is private too (#95): others get the nickname or "Grower 4F2A". The admin and the grower
 * themselves keep the real name.
 */
function publicCard(user: User, viewer: User | null): User {
  const { email: _email, preapproved: _preapproved, dailyScanLimit: _limit, ...card } = user
  // Your own card keeps your consent: the app replaces your user with it, and without it the consent
  // dialog would come back after every directory load.
  if (viewer?.id === user.id) return card
  const { termsVersion: _terms, termsAcceptedAt: _termsAt, ...rest } = card
  if (viewer?.role === 'admin') return rest
  const name = sharedGrowerName(user)
  return { ...rest, name, nameHe: name }
}

function avatarColor(seed: string) {
  const palette = ['#1FA85A', '#5D7C4E', '#C4A35A', '#3C6B8F', '#B4553D']
  let hash = 0
  for (const ch of seed) hash = (hash + ch.charCodeAt(0) * 17) % palette.length
  return palette[hash] ?? palette[0]
}

/** A new grower account from a sign-up: the name, email and the Terms they agreed to on the login page. */
function newMember(input: { name: string; email: string } & TermsConsent, preapproved: boolean): ManagedUser {
  return {
    id: `u-${Date.now()}`,
    name: input.name,
    nameHe: input.name,
    email: input.email,
    role: 'grower',
    // The public name; editable in Profile, never empty.
    nickname: generateNickname(),
    region: UNKNOWN_AREA.region,
    regionHe: UNKNOWN_AREA.regionHe,
    lat: UNKNOWN_AREA.lat,
    lng: UNKNOWN_AREA.lng,
    bio: '',
    bioHe: '',
    rating: 0,
    completedOrders: 0,
    verificationRate: 0,
    cancellations: 0,
    specialties: [],
    specialtiesHe: [],
    avatarColor: avatarColor(input.email),
    friendIds: [],
    accountStatus: 'active',
    preapproved,
    // An older Terms version is asked again on the first visit.
    ...(input.termsVersion && input.termsAcceptedAt
      ? { termsVersion: input.termsVersion, termsAcceptedAt: input.termsAcceptedAt }
      : {}),
  }
}

export const usersService = {
  async listPending(status: PendingUser['status'] | 'all' = 'pending') {
    const rows = await getStore().pendingUsers.list()
    return rows
      .filter((row) => status === 'all' || row.status === status)
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        note: row.note,
        createdAt: row.createdAt,
        status: row.status,
      }))
  },

  async getPending(id: string) {
    const row = (await getStore().pendingUsers.list()).find((item) => item.id === id)
    if (!row) throw Errors.missing(`Pending user ${id} not found`)
    return row
  },

  async requestAccess(input: { name: string; email: string; note?: string } & TermsConsent) {
    const name = input.name.trim()
    const email = input.email.trim().toLowerCase()
    if (!name || !email.includes('@')) throw Errors.invalid('Name and email are required')

    const store = getStore()
    const users = await store.users.list()
    if (users.some((item) => item.email?.toLowerCase() === email)) {
      throw Errors.exists('Email already registered')
    }
    const pending = await store.pendingUsers.list()
    if (pending.some((item) => item.status === 'pending' && item.email === email)) {
      throw Errors.exists('Application already pending')
    }

    const row: PendingUser = {
      id: `pu-${Date.now()}`,
      name,
      email,
      note: input.note?.trim() || undefined,
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...(input.termsVersion && input.termsAcceptedAt
        ? { termsVersion: input.termsVersion, termsAcceptedAt: input.termsAcceptedAt }
        : {}),
    }
    await store.pendingUsers.upsert([row])
    return row
  },

  /**
   * Google sign-up for a new email; a declined application stays declined.
   * App on (`launched`): the account opens now and is returned, not marked pre-approved. An application filed
   * while the app was off is approved the same way.
   * App off: files an application for the admin to pre-approve in Requests (or keeps the open one), returns null.
   */
  async signUpFromGoogle(input: { name: string; email: string } & TermsConsent, launched: boolean) {
    const store = getStore()
    const mine = (await store.pendingUsers.list()).filter((item) => item.email.toLowerCase() === input.email)
    if (mine.some((item) => item.status === 'rejected')) throw Errors.declined('Sign-up was declined')
    const open = mine.find((item) => item.status === 'pending')
    if (open) return launched ? (await usersService.approve(open.id, false)).user : null

    let user: ManagedUser | null = null
    if (launched) {
      const users = await store.users.list()
      if (users.some((item) => item.email?.toLowerCase() === input.email)) throw Errors.exists('Email already registered')
      user = newMember(input, false)
      await store.users.upsert([user])
    } else {
      await usersService.requestAccess(input)
    }
    await notifySignUp(input.name, input.email)
    await analyticsService.track('signup_done', null)
    return user
  },

  /**
   * Opens the account for an application. The admin approving in Requests pre-approves it, so it enters while
   * the app is off; a sign-up approved automatically because the app is on passes `false`.
   */
  async approve(id: string, preapproved = true) {
    const store = getStore()
    const pending = await store.pendingUsers.list()
    const row = pending.find((item) => item.id === id)
    if (!row) throw Errors.missing(`Pending user ${id} not found`)
    if (row.status !== 'pending') throw Errors.invalid('Application is not pending')

    const users = await store.users.list()
    if (users.some((item) => item.email?.toLowerCase() === row.email.toLowerCase())) {
      throw Errors.exists('Email already registered')
    }

    const user = newMember(row, preapproved)
    await store.users.upsert([user])

    row.status = 'approved'
    row.approvedAt = new Date().toISOString()
    row.userId = user.id
    await store.pendingUsers.upsert([row])
    await notifyApproved(row.name)
    return { pending: row, user }
  },

  async reject(id: string) {
    const store = getStore()
    const pending = await store.pendingUsers.list()
    const row = pending.find((item) => item.id === id)
    if (!row) throw Errors.missing(`Pending user ${id} not found`)
    if (row.status !== 'pending') throw Errors.invalid('Application is not pending')
    row.status = 'rejected'
    row.rejectedAt = new Date().toISOString()
    await store.pendingUsers.upsert([row])
    return row
  },

  /**
   * Public greenhouse level: counts and XP only. Care tasks stay private; only how many were done is shared.
   * Same rules as the client (`greenhouseLevel`), so the owner's own card and the public one agree.
   */
  async level(userId: string, viewer?: Pick<User, 'id' | 'role'>) {
    const store = getStore()
    const users = await store.users.list()
    const user = users.find((item) => item.id === userId && item.role !== 'guest')
    if (!user || !canSee(stateOf(user), user.id, viewer)) throw Errors.missing(`User ${userId} not found`)
    const [plants, todos] = await Promise.all([store.plants.list(), store.todos.list()])
    // Plants an admin hid do not count toward the public level.
    const shown = visiblePlants(plants, visibilityIndex(users, plants), viewer)
    return greenhouseLevel(userId, shown, todos)
  },

  /**
   * Growers for the Global directory. Email stays off this payload.
   * A non-admin does not see the admin. The admin sees every greenhouse, including his own.
   */
  async directory(viewer: User | null) {
    const users = await getStore().users.list()
    const adminView = viewer?.role === 'admin'
    return visibleUsers(users, viewer)
      .filter((user) => user.role !== 'guest')
      .filter((user) => (user.accountStatus ?? 'active') !== 'disabled')
      .filter((user) => adminView || user.role !== 'admin')
      .map((user) => publicCard(user, viewer))
  },

  /** Every member's public level, keyed by user id. One read of plants and tasks for the whole directory. */
  async levels(viewer?: Pick<User, 'id' | 'role'>) {
    const store = getStore()
    const [users, plants, todos] = await Promise.all([store.users.list(), store.plants.list(), store.todos.list()])
    const index = visibilityIndex(users, plants)
    const shown = visiblePlants(plants, index, viewer)
    const levels: Record<string, ReturnType<typeof greenhouseLevel>> = {}
    for (const user of visibleUsers(users, viewer)) {
      if (user.role === 'guest') continue
      levels[user.id] = greenhouseLevel(user.id, shown, todos)
    }
    return levels
  },

  async listMembers() {
    const users = await getStore().users.list()
    return users.filter((item) => item.role !== 'guest').map(withAccountStatus)
  },

  async countMembers() {
    const users = await getStore().users.list()
    return users.filter((item) => item.role !== 'guest').length
  },

  async countPending(status: PendingUser['status'] = 'pending') {
    const rows = await getStore().pendingUsers.list()
    return rows.filter((row) => row.status === status).length
  },

  async countPendingTransactions() {
    const rows = await getStore().pendingTransactions.list()
    return rows.filter((row) => row.status === 'pending').length
  },

  async setAccountStatus(userId: string, accountStatus: AccountStatus) {
    const store = getStore()
    const users = await store.users.list()
    const user = users.find((item) => item.id === userId && item.role !== 'guest')
    if (!user) throw Errors.missing(`User ${userId} not found`)
    if (user.role === 'admin' && accountStatus === 'disabled') {
      throw Errors.forbidden('Admin accounts cannot be disabled')
    }
    ;(user as ManagedUser).accountStatus = accountStatus
    await store.users.upsert([user])
    return withAccountStatus(user)
  },

  async setPreapproved(userId: string, preapproved: boolean) {
    const store = getStore()
    const users = await store.users.list()
    const user = users.find((item) => item.id === userId && item.role !== 'guest')
    if (!user) throw Errors.missing(`User ${userId} not found`)
    if ((user.accountStatus ?? 'active') === 'disabled' && preapproved) {
      throw Errors.invalid('A disabled account cannot be pre-approved')
    }
    user.preapproved = preapproved
    await store.users.upsert([user])
    return withAccountStatus(user)
  },

  async listPendingTransactions() {
    const rows = await getStore().pendingTransactions.list()
    return rows
      .filter((row) => row.status === 'pending')
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((row) => ({
        id: row.id,
        kind: row.kind,
        userId: row.userId,
        label: row.label,
        labelHe: row.labelHe,
        amount: row.amount,
        createdAt: row.createdAt,
        status: row.status,
      }))
  },
}
