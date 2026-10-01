import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { PriceRanges } from './PriceRanges'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ maxWidth: 960, padding: 24 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Market/PriceRanges',
  component: PriceRanges,
  decorators: [withApp],
}

export const ClassLadder = () => (
  <PriceRanges
    title="Price ladder"
    hint="Bar = market range · dot = last price"
    grades={['A', 'B']}
    rows={[
      { id: 'b-m', label: 'Pothos Golden · B · M', sub: 'M · Rooted', grade: 'B', low: 7.5, high: 9.8, last: 8.7 },
      { id: 'a-m', label: 'Pothos Golden · A · M', sub: 'M · Rooted', grade: 'A', low: 10.5, high: 14.2, last: 12.4, highlight: true },
      { id: 'a-l', label: 'Pothos Golden · A · L', sub: 'L · Established', grade: 'A', low: 24, high: 31, last: 27.2 },
    ]}
  />
)

export const Categories = () => (
  <PriceRanges
    title="Category prices"
    grades={['A', 'B']}
    rows={[
      {
        id: 'pothos',
        label: 'Pothos',
        sub: '9 classes',
        low: 7.5,
        high: 96,
        marks: [
          { id: '1', value: 8.7, grade: 'B', label: 'B · M' },
          { id: '2', value: 12.4, grade: 'A', label: 'A · M' },
          { id: '3', value: 86, grade: 'A', label: 'A · XL' },
        ],
      },
      { id: 'maple', label: 'Japanese Maple', sub: '2 classes', low: 640, high: 1200, marks: [{ id: 'm', value: 1140, grade: 'A', label: 'A · XL' }] },
    ]}
  />
)
