import type { Catalog, IdentifyMockScenario } from '../../../../../src/mock/types.ts'
import type { PlantnetBody } from '../providers/plantnet.ts'
import { NOT_IN_CATALOG, matchPick } from './catalogPick.ts'

type Result = NonNullable<PlantnetBody['results']>[number]

function envelope(results: Result[]) {
  return {
    query: { project: 'all', images: ['mock'], organs: ['auto'], includeRelatedImages: false, noReject: false },
    language: 'en',
    preferedReferential: 'k-world-flora',
    bestMatch: results[0]?.species?.scientificName ?? '',
    results,
    version: '2025-01-17 (7.3)',
    remainingIdentificationRequests: 499,
  }
}

function species(scientificName: string, authorship: string, genus: string, family: string, commonNames: string[]) {
  return {
    scientificNameWithoutAuthor: scientificName,
    scientificNameAuthorship: authorship,
    scientificName: authorship ? `${scientificName} ${authorship}` : scientificName,
    genus: { scientificNameWithoutAuthor: genus, scientificNameAuthorship: '', scientificName: genus },
    family: { scientificNameWithoutAuthor: family, scientificNameAuthorship: '', scientificName: family },
    commonNames,
  }
}

/** Pl@ntNet v2 `/identify/all` body. Pl@ntNet has no cultivars, so the subcategory rides in a common name. */
export function plantnetMockBody(catalog: Catalog, scenario: IdentifyMockScenario): PlantnetBody {
  if (scenario === 'error') {
    throw new Error('Pl@ntNet HTTP 503: {"statusCode":503,"error":"Service Unavailable"} (mock)')
  }
  if (scenario === 'notPlant') return envelope([])

  const ficus = {
    score: 0.88,
    species: species(
      NOT_IN_CATALOG.scientificName,
      NOT_IN_CATALOG.authorship,
      NOT_IN_CATALOG.genus,
      NOT_IN_CATALOG.family,
      NOT_IN_CATALOG.commonNames,
    ),
    gbif: { id: '5361945' },
    powo: { id: '852456-1' },
  }
  if (scenario === 'notInCatalog') return envelope([ficus])

  const pick = matchPick(catalog)
  const commonNames = pick.subcategory
    ? [pick.commonName, `${pick.commonName} ${pick.subcategory.name}`]
    : [pick.commonName]
  return envelope([
    { score: 0.86, species: species(pick.scientificName, '', pick.genus, '', commonNames) },
    { ...ficus, score: 0.03 },
  ])
}
