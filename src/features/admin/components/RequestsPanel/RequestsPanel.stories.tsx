import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { defaultPlantPhoto } from '../../../../mock/images'
import type { CatalogSuggestion, PendingUser } from '../../../../mock/types'
import { RequestsPanel } from './RequestsPanel'

const applications: PendingUser[] = [
  {
    id: 'pu-lea',
    name: 'Lea Cohen',
    email: 'lea@example.com',
    note: 'Home grower',
    createdAt: '2026-09-28T09:00:00.000Z',
    status: 'pending',
  },
  {
    id: 'pu-noa',
    name: 'Noa Levi',
    email: 'noa@example.com',
    createdAt: '2026-09-20T08:00:00.000Z',
    status: 'approved',
    approvedAt: '2026-09-21T10:00:00.000Z',
  },
  {
    id: 'pu-rami',
    name: 'Rami Azulay',
    email: 'rami@example.com',
    createdAt: '2026-09-18T12:00:00.000Z',
    status: 'rejected',
    rejectedAt: '2026-09-19T09:00:00.000Z',
  },
]

const draft = {
  category: { name: 'Ficus', nameHe: 'פיקוס', ticker: 'FICU', photo: defaultPlantPhoto },
  subcategory: { name: 'Fiddle-leaf', nameHe: 'כינור', code: 'LYRA', photo: defaultPlantPhoto },
  properties: [],
}

const suggestions: CatalogSuggestion[] = [
  {
    id: 'sug-open',
    createdAt: '2026-10-01T12:00:00.000Z',
    name: 'Fiddle-leaf fig',
    scientificName: 'Ficus lyrata',
    genus: 'Ficus',
    commonNames: ['Fiddle-leaf fig'],
    provider: 'gemini',
    hits: 2,
    status: 'open',
    draft,
  },
  {
    id: 'sug-added',
    createdAt: '2026-09-22T12:00:00.000Z',
    name: 'Pothos',
    scientificName: 'Epipremnum aureum',
    genus: 'Epipremnum',
    commonNames: ['Pothos'],
    provider: 'plantnet',
    hits: 4,
    status: 'added',
    draft,
  },
  {
    id: 'sug-declined',
    createdAt: '2026-09-12T12:00:00.000Z',
    name: 'Plastic leaf',
    scientificName: '',
    genus: '',
    commonNames: [],
    provider: 'plantid',
    hits: 1,
    status: 'dismissed',
    draft,
  },
]

const withI18n = (Story: () => ReactNode) => (
  <I18nProvider>
    <Story />
  </I18nProvider>
)

export default {
  title: 'Features/Admin/RequestsPanel',
  component: RequestsPanel,
  decorators: [withI18n],
}

export const Queues = () => <RequestsPanel applications={applications} suggestions={suggestions} />
