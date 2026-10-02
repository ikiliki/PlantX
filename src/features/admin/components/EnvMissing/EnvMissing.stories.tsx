import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { EnvMissing } from './EnvMissing'

const withI18n = (Story: () => ReactNode) => (
  <I18nProvider>
    <Story />
  </I18nProvider>
)

export default {
  title: 'Features/Admin/EnvMissing',
  component: EnvMissing,
  decorators: [withI18n],
}

export const Missing = () => (
  <EnvMissing
    names={[
      { name: 'GEMINI_API_KEY', need: 'identify' },
      { name: 'GOOGLE_CLIENT_ID', need: 'app' },
    ]}
  />
)
