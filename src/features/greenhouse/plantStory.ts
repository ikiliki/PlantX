import type { Plant, User } from '../../mock/types'

/**
 * A plant's story (its activity and stored history) is private to its grower for now; admins see it to
 * moderate. Shared by the server (plant-scoped activity lists) and the passport. Feed posts are separate.
 */
export function canSeePlantStory(
  plant: Pick<Plant, 'ownerId'>,
  viewer: Pick<User, 'id' | 'role'> | null | undefined,
) {
  if (!viewer) return false
  return viewer.id === plant.ownerId || viewer.role === 'admin'
}
