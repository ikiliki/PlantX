import en from '../../i18n/en.json'
import type { ActivityEntry } from './components/ActivityThread/ActivityThread'
import type { FeedUpdateKind, MockDb, Plant } from '../../mock/types'

type Dict = typeof en

const ACTIVITY_KIND_KEY = {
  photo: 'updatePhoto',
  water: 'updateWater',
  propagate: 'updatePropagate',
  grade: 'updateGrade',
  passport: 'updatePassport',
  listing: 'updateListing',
  scan: 'updateScan',
  added: 'updateAdded',
} as const satisfies Record<FeedUpdateKind, keyof Dict['feed']>

/** The row already names the plant (or the kind); drop the same words from the start of its text ("Pothos — Pothos added…"). */
function withoutTitle(label: string, title: string) {
  if (!title || !label.startsWith(title)) return label
  const rest = label.slice(title.length).replace(/^[s·:—-]+/, '')
  return rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : label
}

/**
 * This owner's greenhouse log, oldest first so the latest sits at the bottom.
 * A scan that became a plant is left out: that plant's "added" row tells the same story.
 */
export function ownerActivity(
  db: MockDb,
  ownerId: string,
  plants: Plant[],
  tr: (enText: string, heText: string) => string,
  t: Dict,
): ActivityEntry[] {
  if (!ownerId) return []
  return db.updates
    .filter((item) => item.userId === ownerId)
    .filter((item) => !(item.kind === 'scan' && item.plantId && plants.some((entry) => entry.id === item.plantId)))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((item) => {
      const plant = item.plantId ? plants.find((entry) => entry.id === item.plantId) : undefined
      const scan = item.kind === 'scan'
      const title = plant ? tr(plant.title, plant.titleHe) : t.feed[ACTIVITY_KIND_KEY[item.kind]]
      return {
        at: item.createdAt.slice(0, 16).replace('T', ' '),
        plant: title,
        plantId: plant?.id,
        photo: plant?.photos[0],
        label: withoutTitle(tr(item.body, item.bodyHe), title),
        kind: item.kind,
        updateId: item.id,
        // Scans that became a plant are filtered out above, so a scan here was not added.
        tag: scan ? t.addPlant.scanNotAdded : undefined,
      }
    })
}
