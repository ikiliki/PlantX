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
  edited: 'updateEdited',
  deleted: 'updateDeleted',
} as const satisfies Record<FeedUpdateKind, keyof Dict['feed']>

/** The row already names the plant (or the kind); drop the same words from the start of its text ("Pothos — Pothos added…"). */
function withoutTitle(label: string, title: string) {
  if (!title || !label.startsWith(title)) return label
  const rest = label.slice(title.length).replace(/^[s·:—-]+/, '')
  return rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : label
}

/** This owner's greenhouse log, every kind (scans included), newest first. */
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
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((item) => {
      const plant = item.plantId ? plants.find((entry) => entry.id === item.plantId) : undefined
      const scan = item.kind === 'scan'
      const title = plant ? tr(plant.title, plant.titleHe) : t.feed[ACTIVITY_KIND_KEY[item.kind]]
      return {
        at: item.createdAt,
        plant: title,
        plantId: plant?.id,
        photo: plant?.photos[0],
        label: withoutTitle(tr(item.body, item.bodyHe), title),
        kind: item.kind,
        updateId: item.id,
        // A scan that did not become a plant says so.
        tag: scan && !plant ? t.addPlant.scanNotAdded : undefined,
      }
    })
}
