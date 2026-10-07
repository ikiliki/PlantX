import { EmptyState } from './EmptyState'

export default {
  title: 'Components/EmptyState',
  component: EmptyState,
}

export const TitleOnly = () => <EmptyState title="No listings in this class yet" />

export const WithHint = () => (
  <EmptyState icon="market" title="No listings in this class yet" hint="Growers list plants here when they sell one." />
)
