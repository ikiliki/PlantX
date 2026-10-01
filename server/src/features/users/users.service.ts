import type { User } from '../../../../src/mock/types.ts'
import { Errors } from '../../lib/errors.ts'
import { fileExists, readJson, writeJson } from '../../lib/jsonStore.ts'
import { loadUsers } from '../../lib/session.ts'
import {
  type AccountStatus,
  type ManagedUser,
  type PendingTransaction,
  type PendingUser,
  withAccountStatus,
} from './users.types.ts'

const PENDING_USERS = 'pending-users.json'
const PENDING_TX = 'pending-transactions.json'

function loadPending(): PendingUser[] {
  if (!fileExists(PENDING_USERS)) return []
  return readJson<PendingUser[]>(PENDING_USERS, [])
}

function savePending(rows: PendingUser[]) {
  writeJson(PENDING_USERS, rows)
}

function loadTransactions(): PendingTransaction[] {
  if (!fileExists(PENDING_TX)) return []
  return readJson<PendingTransaction[]>(PENDING_TX, [])
}

function saveUsers(users: User[]) {
  writeJson('users.json', users)
}

function avatarColor(seed: string) {
  const palette = ['#1FA85A', '#5D7C4E', '#C4A35A', '#3C6B8F', '#B4553D']
  let hash = 0
  for (const ch of seed) hash = (hash + ch.charCodeAt(0) * 17) % palette.length
  return palette[hash] ?? palette[0]
}

export const usersService = {
  listPending(status: PendingUser['status'] = 'pending') {
    return loadPending()
      .filter((row) => row.status === status)
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

  getPending(id: string) {
    const row = loadPending().find((item) => item.id === id)
    if (!row) throw Errors.missing(`Pending user ${id} not found`)
    return row
  },

  requestAccess(input: { name: string; email: string; note?: string }) {
    const name = input.name.trim()
    const email = input.email.trim().toLowerCase()
    if (!name || !email.includes('@')) throw Errors.invalid('Name and email are required')

    const users = loadUsers()
    if (users.some((item) => item.email?.toLowerCase() === email)) {
      throw Errors.exists('Email already registered')
    }
    const pending = loadPending()
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
    savePending(pending)
    return row
  },

  approve(id: string) {
    const pending = loadPending()
    const row = pending.find((item) => item.id === id)
    if (!row) throw Errors.missing(`Pending user ${id} not found`)
    if (row.status !== 'pending') throw Errors.invalid('Application is not pending')

    const users = loadUsers()
    if (users.some((item) => item.email?.toLowerCase() === row.email.toLowerCase())) {
      throw Errors.exists('Email already registered')
    }

    const user: ManagedUser = {
      id: `u-${Date.now()}`,
      name: row.name,
      nameHe: row.name,
      email: row.email,
      role: 'grower',
      region: 'Central Israel',
      regionHe: 'מרכז',
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
    }
    users.push(user)
    saveUsers(users)

    row.status = 'approved'
    row.approvedAt = new Date().toISOString()
    row.userId = user.id
    savePending(pending)
    return { pending: row, user }
  },

  reject(id: string) {
    const pending = loadPending()
    const row = pending.find((item) => item.id === id)
    if (!row) throw Errors.missing(`Pending user ${id} not found`)
    if (row.status !== 'pending') throw Errors.invalid('Application is not pending')
    row.status = 'rejected'
    row.rejectedAt = new Date().toISOString()
    savePending(pending)
    return row
  },

  listMembers() {
    return loadUsers()
      .filter((item) => item.role !== 'guest')
      .map(withAccountStatus)
  },

  countMembers() {
    return loadUsers().filter((item) => item.role !== 'guest').length
  },

  countPending(status: PendingUser['status'] = 'pending') {
    return loadPending().filter((row) => row.status === status).length
  },

  countPendingTransactions() {
    return loadTransactions().filter((row) => row.status === 'pending').length
  },

  setAccountStatus(userId: string, accountStatus: AccountStatus) {
    const users = loadUsers()
    const user = users.find((item) => item.id === userId && item.role !== 'guest')
    if (!user) throw Errors.missing(`User ${userId} not found`)
    if (user.role === 'admin' && accountStatus === 'disabled') {
      throw Errors.forbidden('Admin accounts cannot be disabled')
    }
    ;(user as ManagedUser).accountStatus = accountStatus
    saveUsers(users)
    return withAccountStatus(user)
  },

  listPendingTransactions() {
    return loadTransactions()
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
