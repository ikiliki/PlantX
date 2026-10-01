import type { User } from '../../../../src/mock/types.ts'
import { Errors } from '../../lib/errors.ts'
import { BOOTSTRAP_ADMIN } from '../../lib/ensureData.ts'
import type { GoogleProfile } from '../../lib/googleAuth.ts'
import { writeJson } from '../../lib/jsonStore.ts'
import { loadUsers } from '../../lib/session.ts'
import type { ManagedUser } from '../users/users.types.ts'

function isActive(user: User) {
  return ((user as ManagedUser).accountStatus ?? 'active') === 'active'
}

function saveUsers(users: User[]) {
  writeJson('users.json', users)
}

function bootstrapEmail() {
  return (BOOTSTRAP_ADMIN.email ?? '').toLowerCase()
}

/** Operator account — Google SSO only, never email/password. */
export function isBootstrapAdminEmail(email: string) {
  return email.trim().toLowerCase() === bootstrapEmail()
}

function ensureSoleAdmin(users: User[], adminId: string) {
  for (const user of users) {
    if (user.id === adminId) {
      user.role = 'admin'
      ;(user as ManagedUser).accountStatus = 'active'
    } else if (user.role === 'admin') {
      user.role = 'grower'
    }
  }
}

export const sessionService = {
  findById(userId: string) {
    const user = loadUsers().find((item) => item.id === userId && item.role !== 'guest') ?? null
    if (!user || !isActive(user)) return null
    return user
  },

  findByEmail(email: string) {
    const needle = email.trim().toLowerCase()
    const user =
      loadUsers().find((item) => item.role !== 'guest' && item.email?.toLowerCase() === needle) ?? null
    if (!user || !isActive(user)) return null
    return user
  },

  requireById(userId: string) {
    const user = sessionService.findById(userId)
    if (!user) throw Errors.unknown(`No user ${userId}`)
    return user
  },

  requireByEmail(email: string) {
    if (isBootstrapAdminEmail(email)) {
      throw Errors.auth('Admin signs in with Google only')
    }
    const user = sessionService.findByEmail(email)
    if (!user) throw Errors.unknown(`No user for ${email}`)
    return user
  },

  /** Sign in from a verified Google profile. Bootstrap Gmail is the sole admin. */
  loginWithGoogle(profile: GoogleProfile) {
    const email = profile.email.toLowerCase()
    const users = loadUsers()
    const adminMail = bootstrapEmail()
    let user = users.find((item) => item.role !== 'guest' && item.email?.toLowerCase() === email)

    if (email === adminMail) {
      if (!user) {
        user = structuredClone(BOOTSTRAP_ADMIN)
        user.name = profile.name || user.name
        user.email = email
        users.push(user)
      } else {
        if (!isActive(user)) throw Errors.forbidden('Account disabled')
        user.email = email
        if (profile.name) user.name = profile.name
      }
      ensureSoleAdmin(users, user.id)
      saveUsers(users)
      return user
    }

    if (!user) {
      throw Errors.unknown('No PlantX account for this Google email. Request access first.')
    }
    if (!isActive(user)) throw Errors.forbidden('Account disabled')
    if (profile.name && !user.name) user.name = profile.name
    saveUsers(users)
    return user
  },
}
