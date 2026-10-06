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
  return useGreenhouseLevelsState().levels
}

/** Levels plus whether the server's numbers have arrived (always ready in mock mode or signed out). */
export function useGreenhouseLevelsState(): { levels: Record<string, GreenhouseLevel>; ready: boolean } {
  const { db, currentUser, signedIn } = useStore()
  const mock = clientEnv() === 'mock'
  const [remote, setRemote] = useState<Record<string, GreenhouseLevel>>({})
  const [loaded, setLoaded] = useState(false)

  // Levels are members-only on the server.
  useEffect(() => {
    if (mock || !signedIn) return
    let cancelled = false
    void fetchGreenhouseLevels().then((res) => {
      if (cancelled) return
      if (res) setRemote(res.levels)
      // A failed fetch still ends the wait: the cards show without rings rather than a loader forever.
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [mock, signedIn])

  const levels = useMemo(() => {
    if (mock) {
      return Object.fromEntries(db.users.map((user) => [user.id, greenhouseLevel(user.id, db.plants, db.todos)]))
    }
    if (!currentUser) return remote
    return { ...remote, [currentUser.id]: greenhouseLevel(currentUser.id, db.plants, db.todos) }
  }, [mock, remote, currentUser, db.users, db.plants, db.todos])

  return { levels, ready: mock || !signedIn || loaded }
}
