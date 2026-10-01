import type { CommunityGrade, Plant } from './types'

/** Published from the greenhouse, but not sitting on the market. */
const PUBLISHED_OFF_MARKET = new Set(['pl-maya-njoy'])

export const SEEDED_COMMUNITY_GRADES: Record<string, CommunityGrade[]> = {
  'pl-daniel-monstera': [
    { letter: 'S', at: '2026-09-28T09:00:00.000Z', graderId: 'grade-seed-1' },
    { letter: 'A', at: '2026-09-29T15:30:00.000Z', graderId: 'grade-seed-2' },
  ],
  'pl-gal-monstera': [
    { letter: 'A', at: '2026-09-29T11:00:00.000Z', graderId: 'grade-seed-3' },
    { letter: 'B', at: '2026-09-30T06:00:00.000Z', graderId: 'grade-seed-4' },
  ],
  'pl-maya-njoy': [
    { letter: 'B', at: '2026-09-27T18:00:00.000Z', graderId: 'grade-seed-5' },
    { letter: 'C', at: '2026-09-30T08:10:00.000Z', graderId: 'grade-seed-6' },
  ],
}

export function ensureCommunityGrades(plants: Plant[], listingPlantIds: Iterable<string>) {
  const listed = new Set(listingPlantIds)
  for (const plant of plants) {
    if (!plant.grades) {
      const seeded = SEEDED_COMMUNITY_GRADES[plant.id]
      plant.grades = seeded ? seeded.map((grade) => ({ ...grade })) : []
    }
    const published = plant.status === 'listed' || listed.has(plant.id) || PUBLISHED_OFF_MARKET.has(plant.id)
    if (published && !plant.publishedAt) plant.publishedAt = plant.createdAt
  }
}
