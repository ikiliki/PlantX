import type { LandingDevice } from '../../landingShots'
import { Bar, Browser, Dot, Phone, Screen } from './DeviceFrame.styles'

/** A still of the real app in a browser window or a phone. Inert: it is a picture, not a page. */
export function DeviceFrame({
  device,
  src,
  alt,
  eager = false,
}: {
  device: LandingDevice
  src: string
  alt: string
  eager?: boolean
}) {
  const img = <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" draggable={false} />

  if (device === 'phone') {
    return (
      <Phone>
        <Screen $device="phone">{img}</Screen>
      </Phone>
    )
  }

  return (
    <Browser>
      <Bar aria-hidden="true">
        <Dot />
        <Dot />
        <Dot />
      </Bar>
      <Screen $device="desk">{img}</Screen>
    </Browser>
  )
}
