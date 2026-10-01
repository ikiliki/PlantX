import type { ReactNode } from 'react'
import { TodoKindIcon } from './TodoKindIcon'

const withPad = (Story: () => ReactNode) => (
  <div style={{ display: 'flex', gap: 16, padding: 24, alignItems: 'center', background: '#F4F1E8' }}>
    <Story />
  </div>
)

export default {
  title: 'Features/Todo/TodoKindIcon',
  component: TodoKindIcon,
  decorators: [withPad],
}

export const Water = () => <TodoKindIcon kind="water" size={24} />
export const Photo = () => <TodoKindIcon kind="photo" size={24} />
export const Marks = () => (
  <>
    <TodoKindIcon kind="water" size={20} mark />
    <TodoKindIcon kind="photo" size={20} mark />
  </>
)
