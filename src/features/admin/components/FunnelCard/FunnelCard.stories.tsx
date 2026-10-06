import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import type { FunnelDay } from '../../../../mock/types'
import { FunnelView } from './FunnelCard'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <Story />
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Admin/FunnelCard',
  component: FunnelView,
  decorators: [withApp],
}

const days: FunnelDay[] = [
  {
    day: '2026-10-07',
    counts: { landing_view: 42, guest_start: 9, signup_start: 6, signup_done: 4, plant_add_start: 7, plant_saved: 5, care_done: 3 },
    people: { plant_add_start: 4, plant_saved: 4, care_done: 2 },
  },
  {
    day: '2026-10-08',
    counts: { landing_view: 30, guest_start: 5, signup_start: 2, signup_done: 2, session_return: 3, care_done: 6 },
    people: { session_return: 3, care_done: 3 },
  },
]

export const Days = () => <FunnelView days={days} loading={false} />
export const Empty = () => <FunnelView days={[]} loading={false} />
export const Failed = () => <FunnelView days={null} loading={false} error="The API did not answer." />
