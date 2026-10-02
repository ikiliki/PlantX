import { useEffect, useMemo, useState } from 'react'
import { fetchGreenhouseLevels } from '../../mock/liveApi'
import { useStore } from '../../mock/store'
import { clientEnv } from '../../theme/plantxEnv'
import { greenhouseLevel, type GreenhouseLevel } from './greenhouseLevel'

/**
 * Every grower's greenhouse level, keyed by user id. Mock mode has every task, so it counts locally;
 * otherwise other growers' tasks are private and the server sends the numbers. The signed-in
 * grower's own entry always comes from local data, so it moves the moment they add a plant.
 */
export function useGreenhouseLevels(): Record<string, GreenhouseLevel> {
  const { db, currentUser } = useStore()
  const mock = clientEnv() === 'mock'
  const [remote, setRemote] = useState<Record<string, GreenhouseLevel>>({})

  useEffect(() => {
    if (mock) return
    let cancelled = false
    void fetchGreenhouseLevels().then((res) => {
      if (!cancelled && res) setRemote(res.levels)
    })
    return () => {
      cancelled = true
    }
  }, [mock])

  return useMemo(() => {
    if (mock) {
      return Object.fromEntries(db.users.map((user) => [user.id, greenhouseLevel(user.id, db.plants, db.todos)]))
    }
    if (!currentUser) return remote
    return { ...remote, [currentUser.id]: greenhouseLevel(currentUser.id, db.plants, db.todos) }
  }, [mock, remote, currentUser, db.users, db.plants, db.todos])
}
