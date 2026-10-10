import { createContext, createElement, useContext, type ReactNode } from 'react'
import type { DeviceId } from '../theme/release'
import { useMediaQuery } from './useMediaQuery'

const ForcedDevice = createContext<DeviceId | null>(null)

/** Renders its children as if on that device, whatever the window is (Admin → System previews). */
export function DeviceView({ device, children }: { device: DeviceId; children: ReactNode }) {
  return createElement(ForcedDevice.Provider, { value: device }, children)
}

/** The device a component flag reads: phone under 900px of the window, desktop from 900px. */
export function useDevice(): DeviceId {
  const forced = useContext(ForcedDevice)
  const phone = useMediaQuery('(max-width: 899px)')
  return forced ?? (phone ? 'phone' : 'desktop')
}
