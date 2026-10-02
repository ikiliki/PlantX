import { Avatar } from './Avatar'

export default {
  title: 'Components/Avatar',
  component: Avatar,
}

export const Seed = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 24, background: '#F4F1E8' }}>
    <Avatar name="Omri David" color="#1FA85A" size={38} />
    <Avatar name="Chen Assulin" color="#3C6B8F" size={56} />
    <Avatar name="Maya Levi" color="#0B1F14" size={76} />
  </div>
)
