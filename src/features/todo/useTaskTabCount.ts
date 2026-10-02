import { useStore } from '../../mock/store'
import { useSectionFetch } from '../../mock/useServerSlices'
import { taskTabCount } from './todoSchedule'

/** Open-task count for the Tasks tab. Stays 0 until the plant list has settled. */
export function useTaskTabCount() {
  const { db, currentUser, signedIn, sliceFailures } = useStore()
  const waiting = useSectionFetch(signedIn, ['plants', 'todos'])
  if (!signedIn || waiting || sliceFailures.plants) return 0
  return taskTabCount(db.todos, db.plants, currentUser?.id ?? null)
}
