import type { PlantRarity } from '../../mock/types'

export const WIKI_RARITY_ORDER: PlantRarity[] = ['common', 'rare', 'unique']

export function wikiRarityTitle(
  rarity: PlantRarity,
  labels: { unique: string; rare: string; common: string },
) {
  return rarity === 'unique' ? labels.unique : rarity === 'rare' ? labels.rare : labels.common
}

export function groupByRarity<T extends { rarity: PlantRarity }>(rows: T[]) {
  return WIKI_RARITY_ORDER.map((rarity) => ({
    rarity,
    items: rows.filter((item) => item.rarity === rarity),
  })).filter((group) => group.items.length > 0)
}
