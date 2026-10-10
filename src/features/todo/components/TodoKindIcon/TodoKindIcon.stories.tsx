import type { ReactNode } from 'react'
import { CARE_KINDS } from '../../carePlan'
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
export const AllKinds = () => (
  <>
    {CARE_KINDS.map((kind) => (
      <TodoKindIcon key={kind} kind={kind} size={24} />
    ))}
  </>
)
export const Marks = () => (
  <>
    {CARE_KINDS.map((kind) => (
      <TodoKindIcon key={kind} kind={kind} size={20} mark />
    ))}
  </>
)
