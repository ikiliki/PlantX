import { MarketNameTable } from './MarketNameTable'

const columns = [
  { id: 'category', label: 'Category' },
  { id: 'subcategory', label: 'Subcategory' },
  { id: 'grade', label: 'Grade' },
  { id: 'variegation', label: 'Variegation' },
  { id: 'name', label: 'Market name' },
]

const rows = [
  {
    id: '1',
    speciesId: 'sp-pothos',
    subcategoryId: 'pothos-gold',
    category: 'Pothos',
    subcategory: 'Golden',
    name: 'Pothos Golden · A · High',
    code: 'POT-GOLD-A-HIGH',
    values: { grade: 'A', variegation: 'high' },
    labels: { grade: 'A', variegation: 'High' },
  },
]

export default {
  title: 'Features/Admin/MarketNameTable',
  component: MarketNameTable,
}

export const Default = () => (
  <MarketNameTable columns={columns} rows={rows} empty="No classes match these filters." />
)
