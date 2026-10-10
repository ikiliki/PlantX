import type { DeviceId } from '../theme/release'
import { useMediaQuery } from './useMediaQuery'

/** The device a component flag reads: phone under 900px of the window, desktop from 900px. */
export function useDevice(): DeviceId {
  return useMediaQuery('(max-width: 899px)') ? 'phone' : 'desktop'
}
