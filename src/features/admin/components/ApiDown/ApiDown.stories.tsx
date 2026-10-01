import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { ApiDown } from './ApiDown'

const withI18n = (Story: () => ReactNode) => (
  <I18nProvider>
    <Story />
  </I18nProvider>
)

export default {
  title: 'Features/Admin/ApiDown',
  component: ApiDown,
  decorators: [withI18n],
}

export const WithReason = () => (
  <ApiDown detail="HTTP 500 internal — Hosted database is not reachable. Set DATABASE_URL or PROD_DATABASE_URL to the Supabase session URI." />
)

export const NoReason = () => <ApiDown />
