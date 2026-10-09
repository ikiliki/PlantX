import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { fetchMySocial } from '../../mock/liveApi'
import { useStore } from '../../mock/store'
import type { GreenhouseSocialItem } from '../../mock/types'
import type { ActivityEntry } from './components/ActivityThread/ActivityThread'

const COMMENT_PREVIEW = 80

/**
 * Greenhouse activities → Social: 🌿 and comments other growers left on your posts, as activity rows
 * (the plant of the post, who did it, and when). Loads once per open thread on a live server; mock mode has none.
 */
export function useGreenhouseSocial(active: boolean): { entries: ActivityEntry[]; loading: boolean } {
  const { t, tr } = useI18n()
  const { db, liveWritable, signedIn } = useStore()
  const [items, setItems] = useState<GreenhouseSocialItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!active || !signedIn || !liveWritable) return
    let cancelled = false
    setLoading(true)
    void fetchMySocial().then((res) => {
      if (cancelled) return
      setItems(res?.items ?? [])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [active, signedIn, liveWritable])

  const entries = useMemo(
    () =>
      items.map((item): ActivityEntry => {
        const plant = item.plantId ? db.plants.find((row) => row.id === item.plantId) : undefined
        const name = item.userName || item.userId
        const text = item.body.length > COMMENT_PREVIEW ? `${item.body.slice(0, COMMENT_PREVIEW)}…` : item.body
        return {
          at: item.createdAt,
          plant: plant ? tr(plant.title, plant.titleHe) : t.greenhouse.activitySocial,
          plantId: plant?.id,
          photo: plant?.photos[0],
          label:
            item.kind === 'comment'
              ? t.greenhouse.socialCommented.replace('{name}', name).replace('{text}', text)
              : t.greenhouse.socialReacted.replace('{name}', name),
          social: item.kind,
          updateId: item.activityId,
        }
      }),
    [items, db.plants, t, tr],
  )

  return { entries, loading }
}
