import type { Plant, User } from '../../mock/types'
import type { GreenhouseLevel } from './greenhouseLevel'

export type DirectorySort = 'level' | 'plants' | 'recent'

export const DIRECTORY_SORTS: DirectorySort[] = ['level', 'plants', 'recent']

function living(plant: Plant) {
  return plant.status === 'owned' || plant.status === 'listed'
}

/** Living plants per grower. */
export function livingCounts(plants: Plant[]) {
  const counts: Record<string, number> = {}
  for (const plant of plants) if (living(plant)) counts[plant.ownerId] = (counts[plant.ownerId] ?? 0) + 1
  return counts
}

/** When each grower last added a living plant (ms), as a sign of recent activity. */
export function lastPlantAt(plants: Plant[]) {
  const latest: Record<string, number> = {}
  for (const plant of plants) {
    if (!living(plant)) continue
    const at = Date.parse(plant.createdAt) || 0
    if (at > (latest[plant.ownerId] ?? 0)) latest[plant.ownerId] = at
  }
  return latest
}

/** Free-text search over the public face: public name, business name and bio, both languages. */
export function matchesGrower(user: User, needle: string) {
  if (!needle) return true
  const blob = [
    user.nickname?.trim() ? user.nickname : user.name,
    user.nickname?.trim() ? '' : user.nameHe,
    user.businessName,
    user.businessNameHe,
    user.bio,
    user.bioHe,
    user.region,
    user.regionHe,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return blob.includes(needle)
}

/**
 * Directory order. Every sort falls back to level, then XP, then plant count, then the name in number order
 * ("Tester 2" before "Tester 10"), so the list never shuffles between visits.
 */
export function directoryComparator(
  sort: DirectorySort,
  levels: Record<string, GreenhouseLevel | undefined>,
  counts: Record<string, number>,
  latest: Record<string, number>,
) {
  const byLevel = (a: User, b: User) =>
    (levels[b.id]?.level ?? 0) - (levels[a.id]?.level ?? 0) ||
    (levels[b.id]?.xp ?? 0) - (levels[a.id]?.xp ?? 0) ||
    (counts[b.id] ?? 0) - (counts[a.id] ?? 0) ||
    a.name.localeCompare(b.name, undefined, { numeric: true })
  if (sort === 'plants') return (a: User, b: User) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0) || byLevel(a, b)
  if (sort === 'recent') return (a: User, b: User) => (latest[b.id] ?? 0) - (latest[a.id] ?? 0) || byLevel(a, b)
  return byLevel
}

/** Same area as the viewer (the region name, either language). */
export function sameRegion(user: User, viewer: User | null) {
  if (!viewer?.region?.trim()) return false
  return user.region === viewer.region || (Boolean(user.regionHe) && user.regionHe === viewer.regionHe)
}
