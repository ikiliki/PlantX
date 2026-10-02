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

/** This owner's greenhouse log, oldest first so the latest sits at the bottom. */
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
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((item) => {
      const plant = item.plantId ? plants.find((entry) => entry.id === item.plantId) : undefined
      const scan = item.kind === 'scan'
      return {
        at: item.createdAt.slice(0, 16).replace('T', ' '),
        plant: plant ? tr(plant.title, plant.titleHe) : t.feed[ACTIVITY_KIND_KEY[item.kind]],
        plantId: plant?.id,
        photo: plant?.photos[0],
        label: tr(item.body, item.bodyHe),
        kind: item.kind,
        updateId: item.id,
        tag: scan ? (plant ? t.addPlant.scanAdded : t.addPlant.scanNotAdded) : undefined,
      }
    })
}
