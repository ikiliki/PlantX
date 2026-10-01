import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { defaultPlantPhoto } from '../../../../mock/images'
import type { CatalogSuggestion } from '../../../../mock/types'
import { SuggestionEditorDialog } from './SuggestionEditorDialog'

const sample: CatalogSuggestion = {
  id: 'sug-ficus',
  createdAt: '2026-10-01T12:00:00.000Z',
  name: 'Fiddle-leaf fig',
  scientificName: 'Ficus lyrata',
  genus: 'Ficus',
  commonNames: ['Fiddle-leaf fig'],
  provider: 'gemini',
  hits: 2,
  status: 'open',
  draft: {
    category: { name: 'Ficus', nameHe: 'פיקוס', ticker: 'FICU', photo: defaultPlantPhoto },
    subcategory: { name: 'Fiddle-leaf', nameHe: 'כינור', code: 'LYRA', photo: defaultPlantPhoto },
    properties: [
      {
        name: 'Variegation',
        nameHe: 'גיוון',
        required: false,
        inMarketName: true,
        sign: 'VAR',
        scope: 'subcategory',
        options: [
          { label: 'Solid', labelHe: 'אחיד', sign: 'SOL' },
          { label: 'Variegated', labelHe: 'מגוון', sign: 'VAR' },
        ],
      },
    ],
  },
}

const withI18n = (Story: () => ReactNode) => (
  <I18nProvider>
    <Story />
  </I18nProvider>
)

export default {
  title: 'Features/Admin/SuggestionEditorDialog',
  component: SuggestionEditorDialog,
  decorators: [withI18n],
}

export const Filled = () => <SuggestionEditorDialog suggestion={sample} onClose={() => undefined} onConfirm={() => true} />
