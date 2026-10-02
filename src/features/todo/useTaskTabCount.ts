import { useStore } from '../../mock/store'
import { useSectionFetch } from '../../mock/useServerSlices'
import { taskTabCounts } from './todoSchedule'

/** Today and planned task counts for the Tasks tab. Both stay 0 until the plant list has settled. */
export function useTaskTabCount() {
  const { db, currentUser, signedIn, sliceFailures } = useStore()
  const waiting = useSectionFetch(signedIn, ['plants', 'todos'])
  if (!signedIn || waiting || sliceFailures.plants) return { today: 0, planned: 0 }
  return taskTabCounts(db.todos, db.plants, currentUser?.id ?? null)
}
