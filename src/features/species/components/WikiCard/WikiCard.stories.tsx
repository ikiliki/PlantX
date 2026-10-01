import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { WikiCard } from './WikiCard'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ maxWidth: 280, padding: 24 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

function CardFor({ id }: { id: string }) {
  const { db } = useStore()
  const species = db.species.find((item) => item.id === id)
  if (!species) return null
  return <WikiCard species={species} />
}

export default {
  title: 'Features/Species/WikiCard',
  component: WikiCard,
  decorators: [withApp],
}

export const Pothos = () => <CardFor id="sp-pothos" />
export const Monstera = () => <CardFor id="sp-monstera" />
