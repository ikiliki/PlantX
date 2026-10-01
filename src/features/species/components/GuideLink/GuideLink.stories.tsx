import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { GuideLink } from './GuideLink'

const withApp = (Story: () => ReactNode) => (
  <I18nProvider>
    <MemoryRouter>
      <div style={{ maxWidth: 420 }}>
        <Story />
      </div>
    </MemoryRouter>
  </I18nProvider>
)

export default {
  title: 'Features/Species/GuideLink',
  component: GuideLink,
  decorators: [withApp],
}

export const Pothos = () => <GuideLink speciesId="sp-pothos" name="Pothos" />
