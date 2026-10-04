import { createCatalog } from '../../../../mock/catalog'
import type { CatalogSuggestion } from '../../../../mock/types'
import type { SuggestResult } from '../../useCatalogSuggestions'
import { SuggestPlantDialog } from './SuggestPlantDialog'

export default { title: 'Catalog/SuggestPlantDialog' }

const catalog = createCatalog()

function sent(name: string): SuggestResult {
  const suggestion: CatalogSuggestion = {
    id: 'sug-story',
    createdAt: new Date().toISOString(),
    name,
    scientificName: '',
    genus: '',
    commonNames: [name],
    provider: '',
    hits: 1,
    status: 'open',
    origin: 'member',
    suggestedBy: ['me'],
    note: '',
    draft: {
      category: { name, nameHe: '', ticker: 'PLNT', photo: '' },
      subcategory: { name, nameHe: '', code: 'GEN', photo: '' },
      properties: [],
    },
  }
  return { ok: true, suggestion }
}

export const Default = () => (
  <SuggestPlantDialog catalog={catalog} onClose={() => undefined} onSubmit={async (input) => sent(input.name)} />
)

export const SendFails = () => (
  <SuggestPlantDialog
    catalog={catalog}
    onClose={() => undefined}
    onSubmit={async () => ({ ok: false, problem: 'failed' })}
  />
)
