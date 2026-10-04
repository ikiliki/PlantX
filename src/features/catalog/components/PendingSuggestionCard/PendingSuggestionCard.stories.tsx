import type { CatalogSuggestion } from '../../../../mock/types'
import { PendingSuggestionCard } from './PendingSuggestionCard'

export default { title: 'Catalog/PendingSuggestionCard' }

const base: CatalogSuggestion = {
  id: 'sug-1',
  createdAt: '2026-10-04T10:00:00.000Z',
  name: 'Fiddle-leaf fig',
  scientificName: 'Ficus lyrata',
  genus: 'Ficus',
  commonNames: ['Fiddle-leaf fig'],
  provider: '',
  hits: 1,
  status: 'open',
  origin: 'identify',
  suggestedBy: ['me'],
  note: '',
  draft: {
    category: { name: 'Fiddle-leaf fig', nameHe: '', ticker: 'FICU', photo: '' },
    subcategory: { name: 'Fiddle-leaf fig', nameHe: '', code: 'FIDDLE', photo: '' },
    properties: [],
  },
}

export const FromScan = () => (
  <div style={{ width: 220 }}>
    <PendingSuggestionCard suggestion={base} />
  </div>
)

export const Variety = () => (
  <div style={{ width: 220 }}>
    <PendingSuggestionCard
      suggestion={{
        ...base,
        name: 'Thai Constellation',
        scientificName: '',
        origin: 'member',
        draft: { ...base.draft, categoryId: 'monstera', category: { ...base.draft.category, name: 'Monstera' } },
      }}
    />
  </div>
)
