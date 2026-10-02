import type { IdentifyRequestRecord } from '../../mock/types'

/** Story fixtures for the Admin APIs playground and history. */
export const mockMatchRecord: IdentifyRequestRecord = {
  id: 'idr-mock-match',
  createdAt: '2026-10-01T09:12:00.000Z',
  userId: 'u-dana',
  userName: 'Dana Levi',
  source: 'playground',
  mode: 'mock',
  target: 'chain',
  scenario: 'match',
  status: 'ok',
  thumb: '/class-photos/pot-gold-a-l-mat.jpg',
  durationMs: 42,
  tried: [],
  diagnosis: {
    provider: 'gemini',
    mode: 'mock',
    label: 'Golden pothos',
    scientificName: 'Epipremnum aureum',
    commonNames: ['Golden pothos', "Devil's ivy"],
    probability: 0.91,
    isPlant: true,
    draft: {
      categoryId: 'pothos',
      subcategoryId: 'pothos-gold',
      quality: 'A',
      size: 'L',
      stage: 'MATURE',
      traits: { 'growth-form': 'climbing', variegation: 'high' },
    },
    tried: [],
    steps: [
      { id: 'gate', provider: 'gemini', ok: true, isPlant: true },
      { id: 'species', provider: 'plantnet', ok: true, label: 'Golden pothos', scientificName: 'Epipremnum aureum', probability: 0.94, isPlant: true },
      { id: 'draft', provider: 'gemini', ok: true, label: 'Golden pothos', probability: 0.91, isPlant: true },
    ],
  },
}

export const liveFallbackRecord: IdentifyRequestRecord = {
  id: 'idr-live-fallback',
  createdAt: '2026-10-01T08:47:00.000Z',
  userId: 'u-noa',
  userName: 'Noa Katz',
  source: 'addPlant',
  mode: 'live',
  target: 'chain',
  status: 'ok',
  thumb: '/class-photos/mon-std-a-l-mat.jpg',
  durationMs: 2380,
  plantId: 'pl-draft-target',
  photoIndex: 0,
  fields: { category: 'kept', subcategory: 'changed', quality: 'manual', size: 'manual', stage: 'manual' },
  tried: [],
  diagnosis: {
    provider: 'gemini',
    mode: 'live',
    label: 'Monstera deliciosa',
    scientificName: 'Monstera deliciosa Liebm.',
    commonNames: ['Swiss cheese plant', 'Split-leaf philodendron'],
    probability: 0.78,
    isPlant: true,
    draft: { categoryId: 'monstera', subcategoryId: 'monstera-std' },
    tried: [],
    steps: [
      { id: 'gate', provider: 'gemini', ok: true, isPlant: true },
      { id: 'species', provider: 'plantnet', ok: true, label: 'Monstera deliciosa', scientificName: 'Monstera deliciosa', probability: 0.94, isPlant: true },
      { id: 'draft', provider: 'gemini', ok: true, label: 'Monstera deliciosa', probability: 0.78, isPlant: true },
    ],
  },
}

export const mockNotInCatalogRecord: IdentifyRequestRecord = {
  id: 'idr-mock-notincatalog',
  createdAt: '2026-09-30T17:05:00.000Z',
  userId: 'u-dana',
  userName: 'Dana Levi',
  source: 'playground',
  mode: 'mock',
  target: 'gemini',
  scenario: 'notInCatalog',
  status: 'ok',
  durationMs: 18,
  tried: [],
  diagnosis: {
    provider: 'gemini',
    mode: 'mock',
    label: 'Snake plant',
    scientificName: 'Dracaena trifasciata',
    commonNames: ['Snake plant', "Mother-in-law's tongue"],
    probability: 0.86,
    isPlant: true,
    draft: {},
    tried: [],
  },
}

export const liveNotInCatalogRecord: IdentifyRequestRecord = {
  ...mockNotInCatalogRecord,
  id: 'idr-live-notincatalog',
  source: 'playground',
  mode: 'live',
  target: 'chain',
  scenario: undefined,
  durationMs: 1840,
  diagnosis: {
    ...mockNotInCatalogRecord.diagnosis!,
    mode: 'live',
    provider: 'gemini',
  },
}

export const mockNotPlantRecord: IdentifyRequestRecord = {
  id: 'idr-mock-notplant',
  createdAt: '2026-09-30T16:40:00.000Z',
  userId: 'u-dana',
  userName: 'Dana Levi',
  source: 'playground',
  mode: 'mock',
  target: 'chain',
  scenario: 'notPlant',
  status: 'ok',
  durationMs: 12,
  tried: [],
  diagnosis: {
    provider: 'gemini',
    mode: 'mock',
    label: '',
    scientificName: '',
    commonNames: [],
    probability: 0.07,
    isPlant: false,
    draft: {},
    tried: [],
    steps: [{ id: 'gate', provider: 'gemini', ok: true, isPlant: false }],
  },
}

export const liveUnavailableRecord: IdentifyRequestRecord = {
  id: 'idr-live-unavailable',
  createdAt: '2026-09-30T11:22:00.000Z',
  userId: 'u-noa',
  userName: 'Noa Katz',
  source: 'addPlant',
  mode: 'live',
  target: 'chain',
  status: 'unavailable',
  thumb: '/class-photos/pot-njoy-b-m-est.jpg',
  durationMs: 30010,
  tried: [
    { provider: 'plantnet', reason: 'exhausted', detail: 'Daily identify quota exhausted' },
    { provider: 'gemini', reason: 'error', detail: 'Gemini HTTP 503' },
  ],
  steps: [
    { id: 'gate', provider: 'gemini', ok: true, isPlant: true },
    { id: 'species', provider: 'plantnet', ok: false, detail: 'Daily identify quota exhausted' },
    { id: 'draft', provider: 'gemini', ok: false, detail: 'Gemini HTTP 503' },
  ],
}

export const mockErrorRecord: IdentifyRequestRecord = {
  id: 'idr-mock-error',
  createdAt: '2026-09-29T19:03:00.000Z',
  userId: 'u-dana',
  userName: 'Dana Levi',
  source: 'playground',
  mode: 'mock',
  target: 'plantnet',
  scenario: 'error',
  status: 'unavailable',
  durationMs: 9,
  tried: [{ provider: 'plantnet', reason: 'error', detail: 'Mock scenario: provider fails' }],
}

export const identifyHistoryFixture: IdentifyRequestRecord[] = [
  mockMatchRecord,
  liveFallbackRecord,
  mockNotInCatalogRecord,
  mockNotPlantRecord,
  liveUnavailableRecord,
  mockErrorRecord,
]
