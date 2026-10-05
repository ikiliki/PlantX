import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import type { ScanQuota } from '../../../../mock/types'
import { ScanQuotaNote } from './ScanQuotaNote'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ display: 'grid', gap: 12, padding: 24, justifyItems: 'start', maxWidth: 420 }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Greenhouse/ScanQuotaNote',
  component: ScanQuotaNote,
  decorators: [withApp],
}

const quota = (used: number, extra = 0, limit = 3): ScanQuota => ({
  used,
  limit,
  extra,
  remaining: Math.max(0, limit + extra - used),
  resetsAt: '2026-10-06T21:00:00.000Z',
})

export const Fresh = () => <ScanQuotaNote quota={quota(0)} />
export const OneUsed = () => <ScanQuotaNote quota={quota(1)} />
export const WithExtra = () => <ScanQuotaNote quota={quota(3, 2)} />
export const Out = () => <ScanQuotaNote quota={quota(3)} />
