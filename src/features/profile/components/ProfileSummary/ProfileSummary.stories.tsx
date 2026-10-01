import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { ProfileSummary } from './ProfileSummary'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ maxWidth: 330, minHeight: 480 }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Profile/ProfileSummary',
  component: ProfileSummary,
  decorators: [withApp],
}

export const Grower = () => <ProfileSummary userId="u-maya" />

export const Nursery = () => <ProfileSummary userId="u-gal" />

export const Compact = () => <ProfileSummary userId="u-gal" compact />
