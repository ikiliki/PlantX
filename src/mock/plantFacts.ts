import type { GrowingConditions, GrowthTime, Plant, PlantRarity, Species } from './types'

export type PlantFacts = {
  rarity: PlantRarity
  growthTime?: GrowthTime
  conditions?: GrowingConditions
}

type FactSource = {
  rarity?: PlantRarity
  growthTime?: GrowthTime
  conditions?: GrowingConditions
}

/** Specimens that differ from their species default. */
export const PLANT_FACT_OVERRIDES: Record<string, FactSource> = {
  'pl-daniel-monstera': {
    rarity: 'unique',
    conditions: {
      light: 'Bright indirect, no harsh midday sun',
      lightHe: 'אור בהיר עקיף, בלי שמש צהריים קשה',
      water: 'Deep soak when the top third dries',
      waterHe: 'השקיה עמוקה כשהשליש העליון מתייבש',
      note: 'The showpiece — repot only in spring and support the moss pole.',
      noteHe: 'פריט התצוגה — העברת עציץ רק באביב ותמיכה במוט הטחב.',
    },
  },
}

/** Plant values win. Otherwise the species default is used, so a market class can show rarity too. */
export function plantFacts(plant: FactSource | undefined, species: Species | undefined): PlantFacts {
  return {
    rarity: plant?.rarity ?? species?.rarity ?? 'common',
    growthTime: plant?.growthTime ?? species?.growthTime,
    conditions: plant?.conditions ?? species?.conditions,
  }
}

export function factsForPlant(plant: Plant, species: Species[]): PlantFacts {
  return plantFacts(
    plant,
    species.find((item) => item.id === plant.speciesId),
  )
}
