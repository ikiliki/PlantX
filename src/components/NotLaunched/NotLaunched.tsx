import { HoldNotice } from '../HoldNotice/HoldNotice'

/** Full-screen hold for every product route until launch. No app header. */
export function NotLaunched() {
  return <HoldNotice mode="not-launched" />
}
