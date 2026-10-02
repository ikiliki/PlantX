import { useState, type ReactNode } from 'react'
import { IconToggle } from './IconToggle'

function Demo() {
  const [value, setValue] = useState<'all' | 'activities' | 'tasks'>('tasks')
  return (
    <IconToggle
      label="Feed"
      value={value}
      onChange={setValue}
      options={[
        { id: 'all', label: 'All', icon: 'home' },
        { id: 'activities', label: 'Activities', icon: 'greenhouse' },
        { id: 'tasks', label: 'Tasks', icon: 'drop' },
      ]}
    />
  )
}

export default {
  title: 'Components/IconToggle',
  component: IconToggle,
  decorators: [
    (Story: () => ReactNode) => (
      <div style={{ padding: 16, background: '#F4F1E8' }}>
        <Story />
      </div>
    ),
  ],
}

export const Tasks = () => <Demo />
