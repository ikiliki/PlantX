import { PullToRefresh } from './PullToRefresh'

export default {
  title: 'Components/PullToRefresh',
  component: PullToRefresh,
}

/** The spinner state; the pull itself needs a touch screen. */
export const Refreshing = () => <PullToRefresh enabled busy label="Refreshing" onRefresh={() => undefined} />
