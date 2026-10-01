import { isPhotoStale, isWaterDue } from './plantCare'
import type { Plant } from '../../mock/types'

export type GreenhouseNeed =
  | { kind: 'refresh'; plant: Plant }
  | { kind: 'water'; plant: Plant }
  | { kind: 'list'; plant: Plant }
  | { kind: 'add' }

/** Plants that still need a greenhouse action. A plant can need both a photo and water. */
export function greenhouseNeeds(plants: Plant[]): GreenhouseNeed[] {
  const living = plants.filter((plant) => plant.status !== 'sold')
  const refresh = living.filter((plant) => isPhotoStale(plant))
  const water = living.filter((plant) => isWaterDue(plant))
  const list = living.filter((plant) => plant.status === 'owned')
  const needs: GreenhouseNeed[] = [
    ...refresh.map((plant): GreenhouseNeed => ({ kind: 'refresh', plant })),
    ...water.map((plant): GreenhouseNeed => ({ kind: 'water', plant })),
    ...list.map((plant): GreenhouseNeed => ({ kind: 'list', plant })),
  ]
  if (needs.length > 0) return needs
  if (plants.length === 0) return [{ kind: 'add' }]
  return []
}
