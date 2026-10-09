import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { PassportDetails } from './PassportDetails'

function First({ owner }: { owner: boolean }) {
  const { db } = useStore()
  const plant = db.plants[0]
  return plant ? <PassportDetails plant={plant} isOwner={owner} /> : null
}

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ containerType: 'inline-size', width: 480, maxWidth: '100%', padding: 16 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/PassportDetails',
  component: PassportDetails,
}

export const Owner = () => <First owner />
Owner.decorators = [withApp]

export const Visitor = () => <First owner={false} />
Visitor.decorators = [withApp]
