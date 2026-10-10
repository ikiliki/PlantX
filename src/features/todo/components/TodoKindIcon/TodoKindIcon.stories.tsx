import type { ReactNode } from 'react'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider } from '../../../../mock/store'
import { CARE_ICONS, TodoKindIcon } from './TodoKindIcon'

const withPad = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <div style={{ display: 'flex', gap: 16, padding: 24, alignItems: 'center', background: '#F4F1E8' }}>
        <Story />
      </div>
    </I18nProvider>
  </StoreProvider>
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
    {CARE_ICONS.map((icon) => (
      <TodoKindIcon key={icon} icon={icon} size={24} />
    ))}
  </>
)
export const Marks = () => (
  <>
    {CARE_ICONS.map((icon) => (
      <TodoKindIcon key={icon} icon={icon} size={20} mark />
    ))}
  </>
)
