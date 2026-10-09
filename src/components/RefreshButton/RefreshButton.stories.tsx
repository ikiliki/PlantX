import { RefreshButton } from './RefreshButton'

export default {
  title: 'Components/RefreshButton',
  component: RefreshButton,
}

export const Idle = () => <RefreshButton label="Refresh" busy={false} onClick={() => undefined} />
export const Busy = () => <RefreshButton label="Refresh" busy onClick={() => undefined} />
export const Pill = () => <RefreshButton label="Refresh" text="Refresh" busy={false} onClick={() => undefined} />
