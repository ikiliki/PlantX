import type { Catalog, IdentifyMockScenario } from '../../../../../src/mock/types.ts'
import type { PlantidBody } from '../providers/plantid.ts'
import { NOT_IN_CATALOG, matchPick } from './catalogPick.ts'

type Suggestion = NonNullable<NonNullable<NonNullable<PlantidBody['result']>['classification']>['suggestions']>[number]

function envelope(isPlant: boolean, plantProbability: number, suggestions: Suggestion[]) {
  const now = Date.now() / 1000
  return {
    access_token: 'mock-plantid-token',
    model_version: 'plant_id:5.0.0',
    custom_id: null,
    input: { latitude: null, longitude: null, similar_images: false, images: ['mock'], datetime: new Date().toISOString() },
    result: {
      is_plant: { probability: plantProbability, threshold: 0.5, binary: isPlant },
      classification: { suggestions },
    },
    status: 'COMPLETED',
    sla_compliant_client: true,
    sla_compliant_system: true,
    created: now,
    completed: now + 0.4,
  }
}

/** Plant.id v3 `/identification?details=common_names,taxonomy` body. */
export function plantidMockBody(catalog: Catalog, scenario: IdentifyMockScenario): PlantidBody {
  if (scenario === 'error') {
    throw new Error('Plant.id HTTP 500: {"error":"Internal server error"} (mock)')
  }
  if (scenario === 'notPlant') {
    return envelope(false, 0.04, [
      { id: 'mock-np-1', name: 'Plantae', probability: 0.02, details: { common_names: null, taxonomy: null } },
    ])
  }
  if (scenario === 'notInCatalog') {
    return envelope(true, 0.99, [
      {
        id: 'mock-ficus-1',
        name: NOT_IN_CATALOG.scientificName,
        probability: 0.93,
        details: {
          common_names: NOT_IN_CATALOG.commonNames,
          taxonomy: { genus: NOT_IN_CATALOG.genus, family: NOT_IN_CATALOG.family },
        },
      },
    ])
  }
  const pick = matchPick(catalog)
  const name = pick.subcategory ? `${pick.scientificName} '${pick.subcategory.name}'` : pick.scientificName
  return envelope(true, 0.98, [
    {
      id: 'mock-match-1',
      name,
      probability: 0.91,
      details: { common_names: [pick.commonName], taxonomy: { genus: pick.genus, family: null } },
    },
    {
      id: 'mock-match-2',
      name: NOT_IN_CATALOG.scientificName,
      probability: 0.04,
      details: { common_names: NOT_IN_CATALOG.commonNames, taxonomy: { genus: NOT_IN_CATALOG.genus } },
    },
  ])
}
