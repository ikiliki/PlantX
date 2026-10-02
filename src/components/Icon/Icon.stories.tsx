import { Icon, type IconName } from './Icon'

const names: IconName[] = ['home', 'market', 'greenhouse', 'rank', 'wiki', 'admin', 'chevron', 'arrowUp', 'light', 'drop', 'food', 'chart', 'calendar', 'globe', 'friends', 'bell']

export default {
  title: 'Components/Icon',
  component: Icon,
}

export const All = () => (
  <div style={{ display: 'flex', gap: 16 }}>
    {names.map((name) => (
      <Icon key={name} name={name} label={name} />
    ))}
  </div>
)

export const Large = () => <Icon name="greenhouse" size={40} />
