import { greenhouseLevel } from '../../../../src/features/greenhouse/greenhouseLevel.ts'
import {
  avatarUnlocked,
  cleanNickname,
  isAvatarIconId,
} from '../../../../src/features/profile/avatarIcons.ts'
import type { User } from '../../../../src/mock/types.ts'
import { getStore } from '../../db/index.ts'
import { changedSince, snapshot } from '../../lib/changedRows.ts'
import { Errors } from '../../lib/errors.ts'
import { BOOTSTRAP_ADMIN } from '../../lib/ensureData.ts'
import type { GoogleProfile } from '../../lib/googleAuth.ts'
import { usersService } from '../users/users.service.ts'

function isActive(user: User) {
  return (user.accountStatus ?? 'active') === 'active'
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
      user.accountStatus = 'active'
    } else if (user.role === 'admin') {
      user.role = 'grower'
    }
  }
}

export const sessionService = {
  async findById(userId: string) {
    const users = await getStore().users.list()
    const user = users.find((item) => item.id === userId && item.role !== 'guest') ?? null
    if (!user || !isActive(user)) return null
    return user
  },

  async findByEmail(email: string) {
    const needle = email.trim().toLowerCase()
    const users = await getStore().users.list()
    const user = users.find((item) => item.role !== 'guest' && item.email?.toLowerCase() === needle) ?? null
    if (!user || !isActive(user)) return null
    return user
  },

  async requireById(userId: string) {
    const user = await sessionService.findById(userId)
    if (!user) throw Errors.unknown(`No user ${userId}`)
    return user
  },

  async requireByEmail(email: string) {
    if (isBootstrapAdminEmail(email)) {
      throw Errors.auth('Admin signs in with Google only')
    }
    const user = await sessionService.findByEmail(email)
    if (!user) throw Errors.unknown(`No user for ${email}`)
    return user
  },

  /** Sign in from a verified Google profile. Bootstrap Gmail is the sole admin. */
  async loginWithGoogle(profile: GoogleProfile) {
    const email = profile.email.toLowerCase()
    const store = getStore()
    const users = await store.users.list()
    const before = snapshot(users)
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
      await store.users.upsert(changedSince(before, users))
      return user
    }

    if (!user) {
      // The first Google sign-in is the sign-up: file it for admin approval.
      await usersService.signUpFromGoogle({ name: profile.name || email.split('@')[0], email })
      throw Errors.pending('Your account is waiting for approval')
    }
    if (!isActive(user)) throw Errors.declined('Account disabled')
    if (profile.name && !user.name) user.name = profile.name
    await store.users.upsert(changedSince(before, users))
    return user
  },

  /** The signed-in account only. The nickname is what others see. The icon must already be unlocked. */
  async updateAccount(userId: string, input: { nickname?: string; avatarIcon?: string }) {
    const store = getStore()
    const users = await store.users.list()
    const user = users.find((item) => item.id === userId && item.role !== 'guest')
    if (!user || !isActive(user)) throw Errors.auth()

    if (input.nickname !== undefined) {
      const nickname = cleanNickname(input.nickname)
      if (nickname) user.nickname = nickname
      else delete user.nickname
    }

    if (input.avatarIcon !== undefined) {
      if (!isAvatarIconId(input.avatarIcon)) throw Errors.invalid('Unknown icon')
      const [plants, todos] = await Promise.all([store.plants.list(), store.todos.list()])
      const level = greenhouseLevel(userId, plants, todos).level
      if (!avatarUnlocked(input.avatarIcon, level)) throw Errors.forbidden('Icon is still locked')
      user.avatarIcon = input.avatarIcon
    }

    await store.users.upsert([user])
    return user
  },
}
