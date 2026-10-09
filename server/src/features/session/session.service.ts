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
import { bootstrapAdmin } from '../../lib/ensureData.ts'
import { bootstrapAdminEmail } from '../../lib/env.ts'
import { isActive } from '../../lib/session.ts'
import { PASSWORD_MIN, signInWithPassword, signUpWithPassword } from '../../lib/passwordAuth.ts'
import { notifySignIn } from '../../lib/events.ts'
import { systemService } from '../system/system.service.ts'
import { usersService } from '../users/users.service.ts'
import { LEGAL_VERSION } from '../../../../src/features/legal/legalVersion.ts'

/** The consent fields for agreeing to the current Terms now, or nothing for any other version. */
function consentNow(version: unknown) {
  return version === LEGAL_VERSION ? { termsVersion: LEGAL_VERSION, termsAcceptedAt: new Date().toISOString() } : {}
}

/** Operator account — Google SSO only, never email/password. False when the env var is unset. */
export function isBootstrapAdminEmail(email: string) {
  const admin = bootstrapAdminEmail()
  return Boolean(admin) && email.trim().toLowerCase() === admin
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

  async listActive() {
    const users = await getStore().users.list()
    return users.filter((user) => user.role !== 'guest' && isActive(user))
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

  /**
   * Sign in from a verified email (Google, or a PP password). Bootstrap Gmail is the sole admin. `termsVersion`
   * is the version the person ticked on the login page: required to sign up, recorded for a member when it is current.
   */
  async loginVerified(profile: { email: string; name: string }, termsVersion?: unknown) {
    const consent = consentNow(termsVersion)
    const email = profile.email.toLowerCase()
    const store = getStore()
    const users = await store.users.list()
    const before = snapshot(users)
    let user = users.find((item) => item.role !== 'guest' && item.email?.toLowerCase() === email)

    if (isBootstrapAdminEmail(email)) {
      if (!user) {
        // Google verified this address and it is the configured operator: it claims the existing admin row
        // (whatever email that row had), or a fresh one on an empty database.
        const adminId = bootstrapAdmin().id
        user = users.find((item) => item.id === adminId)
        if (!user) {
          user = bootstrapAdmin()
          users.push(user)
        }
        user.name = profile.name || user.name
        user.email = email
      } else {
        if (!isActive(user)) throw Errors.forbidden('Account disabled')
        user.email = email
        if (profile.name) user.name = profile.name
      }
      ensureSoleAdmin(users, user.id)
      Object.assign(user, consent)
      await store.users.upsert(changedSince(before, users))
      await notifySignIn(user)
      return user
    }

    if (!user) {
      // The first Google sign-in is the sign-up, with the Terms agreed. App on: the account opens and signs in.
      // App off: it waits for the admin to pre-approve it.
      if (!consent.termsVersion) throw Errors.invalid('Agree to the Terms of Use and Privacy Policy to sign up')
      const { launched } = await systemService.get()
      const created = await usersService.signUpFromGoogle(
        { name: profile.name || email.split('@')[0], email, ...consent },
        launched,
      )
      if (!created) throw Errors.pending('Your account is waiting for approval')
      await notifySignIn(created)
      return created
    }
    if (!isActive(user)) throw Errors.declined('Account disabled')
    if (profile.name && !user.name) user.name = profile.name
    Object.assign(user, consent)
    await store.users.upsert(changedSince(before, users))
    await notifySignIn(user)
    return user
  },

  /** PP: email + password. A correct password with no PlantX account yet (e.g. deleted) signs up again. */
  async loginWithPassword(email: unknown, password: unknown, termsVersion?: unknown) {
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      throw Errors.invalid('Enter your email and password')
    }
    const verified = await signInWithPassword(email.trim().toLowerCase(), password)
    return sessionService.loginVerified({ email: verified, name: '' }, termsVersion)
  },

  /**
   * PP: a new email + password account. Refused for an email PlantX already knows (a member or an application),
   * so nobody can claim a Google member's or the admin's address with a password of their own.
   */
  async signUpWithPassword(input: { email?: unknown; password?: unknown; name?: unknown; termsVersion?: unknown }) {
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
    const password = typeof input.password === 'string' ? input.password : ''
    const name = typeof input.name === 'string' ? input.name.trim().slice(0, 60) : ''
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Errors.invalid('Enter a valid email')
    if (password.length < PASSWORD_MIN) throw Errors.invalid(`Use at least ${PASSWORD_MIN} characters`)
    if (!consentNow(input.termsVersion).termsVersion) {
      throw Errors.invalid('Agree to the Terms of Use and Privacy Policy to sign up')
    }
    const store = getStore()
    const [users, applications] = await Promise.all([store.users.list(), store.pendingUsers.list()])
    const known =
      users.some((item) => item.role !== 'guest' && item.email?.toLowerCase() === email) ||
      applications.some((item) => item.email.toLowerCase() === email)
    if (known || isBootstrapAdminEmail(email)) throw Errors.exists('This email already has an account. Sign in instead.')
    const verified = await signUpWithPassword(email, password)
    return sessionService.loginVerified({ email: verified, name }, input.termsVersion)
  },

  /** The signed-in member agrees to the current Terms and Privacy Policy. Only the current version counts. */
  async acceptTerms(userId: string, version: unknown) {
    if (version !== LEGAL_VERSION) throw Errors.invalid('That is not the current version of the Terms')
    const store = getStore()
    const user = (await store.users.list()).find((item) => item.id === userId && item.role !== 'guest')
    if (!user || !isActive(user)) throw Errors.auth()
    Object.assign(user, consentNow(version))
    await store.users.upsert([user])
    return user
  },

  /**
   * The member deletes their own account: the account, plants, photos, activity, tasks and scans are erased,
   * not hidden, and cannot be restored. The operator account cannot delete itself.
   */
  async deleteAccount(userId: string) {
    const user = await sessionService.findById(userId)
    if (!user || user.role === 'guest') throw Errors.auth()
    if (user.role === 'admin') throw Errors.forbidden('The admin account cannot be deleted')
    await getStore().accounts.erase(userId)
  },

  /** The signed-in account only. The nickname is what others see. The icon must already be unlocked. */
  async updateAccount(userId: string, input: { nickname?: string; avatarIcon?: string }) {
    const store = getStore()
    const users = await store.users.list()
    const user = users.find((item) => item.id === userId && item.role !== 'guest')
    if (!user || !isActive(user)) throw Errors.auth()

    if (input.nickname !== undefined) {
      const nickname = cleanNickname(input.nickname)
      // Everyone has a public name: it can change, not go blank.
      if (!nickname) throw Errors.invalid('A nickname is 1 to 32 characters')
      user.nickname = nickname
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
