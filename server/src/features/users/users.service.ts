import { UNKNOWN_AREA } from '../../../../src/mock/locations.ts'
import { greenhouseLevel } from '../../../../src/features/greenhouse/greenhouseLevel.ts'
import { getStore } from '../../db/index.ts'
import { Errors } from '../../lib/errors.ts'
import {
  type AccountStatus,
  type ManagedUser,
  type PendingUser,
  withAccountStatus,
} from './users.types.ts'

function avatarColor(seed: string) {
  const palette = ['#1FA85A', '#5D7C4E', '#C4A35A', '#3C6B8F', '#B4553D']
  let hash = 0
  for (const ch of seed) hash = (hash + ch.charCodeAt(0) * 17) % palette.length
  return palette[hash] ?? palette[0]
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

  async requestAccess(input: { name: string; email: string; note?: string }) {
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
    }
    pending.unshift(row)
    await store.pendingUsers.saveAll(pending)
    return row
  },

  /** Google sign-up for a new email. Reuses an open application; a declined one stays declined. */
  async signUpFromGoogle(input: { name: string; email: string }) {
    const pending = await getStore().pendingUsers.list()
    const mine = pending.filter((item) => item.email.toLowerCase() === input.email)
    if (mine.some((item) => item.status === 'pending')) return
    if (mine.some((item) => item.status === 'rejected')) throw Errors.declined('Sign-up was declined')
    await usersService.requestAccess(input)
  },

  async approve(id: string) {
    const store = getStore()
    const pending = await store.pendingUsers.list()
    const row = pending.find((item) => item.id === id)
    if (!row) throw Errors.missing(`Pending user ${id} not found`)
    if (row.status !== 'pending') throw Errors.invalid('Application is not pending')

    const users = await store.users.list()
    if (users.some((item) => item.email?.toLowerCase() === row.email.toLowerCase())) {
      throw Errors.exists('Email already registered')
    }

    const user: ManagedUser = {
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
      avatarColor: avatarColor(row.email),
      friendIds: [],
      accountStatus: 'active',
      preapproved: true,
    }
    users.push(user)
    await store.users.saveAll(users)

    row.status = 'approved'
    row.approvedAt = new Date().toISOString()
    row.userId = user.id
    await store.pendingUsers.saveAll(pending)
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
    await store.pendingUsers.saveAll(pending)
    return row
  },

  /**
   * Public greenhouse level: counts and XP only. Care tasks stay private; only how many were done is shared.
   * Same rules as the client (`greenhouseLevel`), so the owner's own card and the public one agree.
   */
  async level(userId: string) {
    const store = getStore()
    const users = await store.users.list()
    const user = users.find((item) => item.id === userId && item.role !== 'guest')
    if (!user) throw Errors.missing(`User ${userId} not found`)
    const [plants, todos] = await Promise.all([store.plants.list(), store.todos.list()])
    return greenhouseLevel(userId, plants, todos)
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
    await store.users.saveAll(users)
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
    await store.users.saveAll(users)
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
