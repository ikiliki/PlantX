import { landingShots } from '../../landingShots'
import { DeviceFrame } from './DeviceFrame'

export default {
  title: 'Features/Landing/DeviceFrame',
  component: DeviceFrame,
}

export const Desktop = () => (
  <div style={{ maxWidth: 720, padding: 24, background: '#F4F1E8' }}>
    <DeviceFrame device="desk" src={landingShots.greenhouseDesk} alt="Greenhouse" eager />
  </div>
)

export const Phone = () => (
  <div style={{ padding: 24, background: '#F4F1E8' }}>
    <DeviceFrame device="phone" src={landingShots.homePhone} alt="Home" eager />
  </div>
)
