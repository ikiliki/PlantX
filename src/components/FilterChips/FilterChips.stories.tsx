import { useState } from 'react'
import { FilterChips } from './FilterChips'

export default {
  title: 'Components/FilterChips',
  component: FilterChips,
}

export const WithIcons = () => {
  const [value, setValue] = useState<'all' | 'activities' | 'tasks'>('all')
  return (
    <div style={{ containerType: 'inline-size', padding: 16, background: '#F4F1E8' }}>
      <FilterChips
        label="Feed"
        value={value}
        onChange={setValue}
        options={[
          { id: 'all', label: 'All', count: 12, icon: 'home' },
          { id: 'activities', label: 'Activities', count: 8, icon: 'greenhouse' },
          { id: 'tasks', label: 'Tasks', count: 4, icon: 'drop' },
        ]}
      />
    </div>
  )
}
