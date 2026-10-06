import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import type { SystemHealth } from '../../../../mock/types'
import { SystemHealthView } from './SystemHealth'

const withI18n = (Story: () => ReactNode) => (
  <I18nProvider>
    <Story />
  </I18nProvider>
)

export default {
  title: 'Features/Admin/SystemHealth',
  component: SystemHealthView,
  decorators: [withI18n],
}

const healthy: SystemHealth = {
  checkedAt: '2026-10-06T12:00:00.000Z',
  api: { ok: true, version: '8607b5f', env: 'prod', region: 'syd1' },
  database: { ok: true, ms: 84, error: null },
  migration: { applied: '20261006120000', expected: '20261006120000' },
  identify: { ready: true, missing: 0 },
  missing: [],
  errors: {
    since: '2026-10-06T11:40:00.000Z',
    server: { count: 0, lastAt: null, lastMessage: null },
    client: { count: 0, lastAt: null, lastMessage: null },
  },
  alerts: { configured: true },
}

export const Healthy = () => <SystemHealthView health={healthy} loading={false} onRefresh={() => undefined} />

export const Degraded = () => (
  <SystemHealthView
    health={{
      ...healthy,
      database: { ok: false, ms: 20000, error: 'Hosted database is not reachable. Check DATABASE_URL or PROD_DATABASE_URL.' },
      migration: { applied: null, expected: '20261006120000' },
      identify: { ready: false, missing: 1 },
      errors: {
        since: healthy.errors.since,
        server: { count: 3, lastAt: '2026-10-06T11:58:00.000Z', lastMessage: 'Unexpected error' },
        client: { count: 1, lastAt: '2026-10-06T11:50:00.000Z', lastMessage: 'Cannot read properties of undefined' },
      },
      alerts: { configured: false },
    }}
    loading={false}
    onRefresh={() => undefined}
  />
)

export const Loading = () => <SystemHealthView health={null} loading onRefresh={() => undefined} />

export const Failed = () => (
  <SystemHealthView health={null} loading={false} error="The server did not answer." onRefresh={() => undefined} />
)
