import { useEffect, useState } from 'react'
import { fetchPlantTodos } from '../../mock/liveApi'
import { useStore } from '../../mock/store'
import type { Plant, Todo } from '../../mock/types'
import { clientEnv } from '../../theme/plantxEnv'

/**
 * One plant's tasks for its passport. Your own plant reads the store (live as you complete care); another
 * grower's plant is fetched read-only from `GET /api/todos/plant/:id`. Mock mode holds every grower's tasks.
 */
export function usePlantTodos(plant: Pick<Plant, 'id'>, mine: boolean): Todo[] {
  const { db } = useStore()
  const live = clientEnv() !== 'mock'
  const fetchIt = live && !mine
  const [remote, setRemote] = useState<Todo[]>([])

  useEffect(() => {
    if (!fetchIt) return
    let gone = false
    setRemote([])
    void fetchPlantTodos(plant.id).then((res) => {
      if (!gone) setRemote(res?.todos ?? [])
    })
    return () => {
      gone = true
    }
  }, [plant.id, fetchIt])

  if (fetchIt) return remote
  return (db.todos ?? []).filter((todo) => todo.plantId === plant.id)
}
