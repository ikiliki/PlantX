import { useState, type ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { identifyHistoryFixture } from '../../identifyFixtures'
import { IdentifyHistory, type IdentifyHistoryFilter } from './IdentifyHistory'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <Story />
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Admin/IdentifyHistory',
  component: IdentifyHistory,
  decorators: [withApp],
}

function History({ initial = 'all' }: { initial?: IdentifyHistoryFilter }) {
  const [filter, setFilter] = useState<IdentifyHistoryFilter>(initial)
  const records =
    filter === 'all' ? identifyHistoryFixture : identifyHistoryFixture.filter((row) => row.mode === filter)
  return (
    <IdentifyHistory
      records={records}
      filter={filter}
      onFilterChange={setFilter}
      onRefresh={() => undefined}
    />
  )
}

export const All = () => <History />

export const LiveOnly = () => <History initial="live" />

export const Phone = () => (
  <div style={{ maxWidth: 375 }}>
    <History />
  </div>
)

/** Add Plant calls only: one linked to the saved plant (with field chips), one never added. */
export const AddPlantCalls = () => (
  <IdentifyHistory
    records={identifyHistoryFixture.filter((row) => row.source === 'addPlant')}
    filter="all"
    onFilterChange={() => undefined}
  />
)

export const Empty = () => (
  <IdentifyHistory records={[]} filter="all" onFilterChange={() => undefined} onRefresh={() => undefined} />
)

export const Loading = () => (
  <IdentifyHistory records={[]} filter="all" onFilterChange={() => undefined} onRefresh={() => undefined} loading />
)
