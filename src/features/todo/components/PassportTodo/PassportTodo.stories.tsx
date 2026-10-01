import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../../../../i18n/I18nProvider'
import { StoreProvider, useStore } from '../../../../mock/store'
import { PassportTodo } from './PassportTodo'

const withApp = (Story: () => ReactNode) => (
  <StoreProvider source="example">
    <I18nProvider>
      <MemoryRouter>
        <div style={{ padding: 24, maxWidth: 420, background: '#F4F1E8' }}>
          <Story />
        </div>
      </MemoryRouter>
    </I18nProvider>
  </StoreProvider>
)

export default {
  title: 'Features/Todo/PassportTodo',
  component: PassportTodo,
  decorators: [withApp],
}

export const Default = () => {
  const { db, currentUser } = useStore()
  const ownerId = currentUser?.id ?? db.visitorId
  const plant = db.plants.find((item) => item.ownerId === ownerId) ?? db.plants[0]
  const todos = db.todos.filter((todo) => todo.plantId === plant.id)
  return <PassportTodo plant={plant} todos={todos} careMark="water" />
}
