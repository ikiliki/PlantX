/**
 * Faces for the account bubble and every grower avatar.
 * A new icon is a row here. `unlockLevel` is the greenhouse level that opens it.
 * A shop can add more later; the catalog is the only list the server will accept.
 */

export const AVATAR_ICON_IDS = ['seed'] as const

export type AvatarIconId = (typeof AVATAR_ICON_IDS)[number]

export type AvatarIconDef = {
  id: AvatarIconId
  /** Greenhouse level that unlocks this icon. Level 1 is where every account starts. */
  unlockLevel: number
}

export const AVATAR_ICONS: AvatarIconDef[] = [{ id: 'seed', unlockLevel: 1 }]

export const DEFAULT_AVATAR_ICON: AvatarIconId = 'seed'

export const NICKNAME_MAX = 32

export function isAvatarIconId(value: string | undefined | null): value is AvatarIconId {
  return AVATAR_ICON_IDS.includes(value as AvatarIconId)
}

/** Known icon, or the seed when the value is missing or retired. */
export function avatarIconId(value: string | undefined | null): AvatarIconId {
  return isAvatarIconId(value) ? value : DEFAULT_AVATAR_ICON
}

export function avatarUnlocked(id: AvatarIconId, level: number) {
  const icon = AVATAR_ICONS.find((item) => item.id === id)
  return Boolean(icon && level >= icon.unlockLevel)
}

/** One line, no line breaks, capped. Empty means the nickname is cleared. */
export function cleanNickname(value: string) {
  return value.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, NICKNAME_MAX)
}

/** The name other people see. A nickname replaces the account name. */
export function publicGrowerName(
  user: { name: string; nameHe?: string; nickname?: string | null },
  he: boolean,
) {
  const nick = user.nickname?.trim()
  if (nick) return nick
  return he ? user.nameHe || user.name : user.name
}
