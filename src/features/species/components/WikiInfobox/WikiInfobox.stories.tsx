import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { WikiInfobox } from './WikiInfobox'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ maxWidth: 280, padding: 24 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

function Box({ speciesId }: { speciesId: string }) {
  const { db } = useStore()
  const species = db.species.find((item) => item.id === speciesId) ?? db.species[0]
  return <WikiInfobox species={species} />
}

export default {
  title: 'Features/Species/WikiInfobox',
  component: WikiInfobox,
  decorators: [withApp],
}

export const Pothos = () => <Box speciesId="sp-pothos" />
export const Monstera = () => <Box speciesId="sp-monstera" />
