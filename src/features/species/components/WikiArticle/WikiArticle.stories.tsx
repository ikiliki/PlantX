import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { WikiArticle } from './WikiArticle'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ maxWidth: 1100, padding: 24 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

function Article({ speciesId }: { speciesId: string }) {
  const { db } = useStore()
  const species = db.species.find((item) => item.id === speciesId) ?? db.species[0]
  return <WikiArticle species={species} />
}

export default {
  title: 'Features/Species/WikiArticle',
  component: WikiArticle,
  decorators: [withApp],
}

export const Pothos = () => <Article speciesId="sp-pothos" />
export const WikiPage = () => {
  const { db } = useStore()
  const species = db.species.find((item) => item.id === 'sp-pothos') ?? db.species[0]
  return <WikiArticle species={species} showMarket={false} />
}
export const Monstera = () => <Article speciesId="sp-monstera" />
