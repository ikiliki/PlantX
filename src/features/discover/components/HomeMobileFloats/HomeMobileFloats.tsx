import { useState } from 'react'
import { FloatChip } from '../../../../components/FloatChip/FloatChip'
import { FeatureGate } from '../../../../components/FeatureGate/FeatureGate'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useMediaQuery } from '../../../../lib/useMediaQuery'
import { useStore } from '../../../../mock/store'
import { isFeatureEnabled } from '../../../../theme/release'
import type { Todo } from '../../../../mock/types'
import { TodoTable } from '../../../todo/components/TodoTable/TodoTable'
import { TodoCareDialog } from '../../../todo/components/TodoCareDialog/TodoCareDialog'
import { TodoKindIcon } from '../../../todo/components/TodoKindIcon/TodoKindIcon'
import { canFillTodo, dueTodos } from '../../../todo/todoSchedule'
import { TodoCount, TodoFace } from './HomeMobileFloats.styles'

const MOBILE_MQ = '(max-width: 899px)'

/** Needs today chip for the home feed on phones. The greenhouse lure stays on the desktop rail. */
export function HomeMobileFloats() {
  const mobile = useMediaQuery(MOBILE_MQ)
  const { t } = useI18n()
  const { db, signedIn, currentUser, completeTodo } = useStore()
  const [careTodo, setCareTodo] = useState<Todo | undefined>()

  if (!mobile) return null

  const todoOn = isFeatureEnabled(db.system, 'todo') && signedIn && currentUser
  const todos = todoOn ? db.todos.filter((todo) => todo.ownerId === currentUser.id) : []
  const plants = todoOn ? db.plants.filter((plant) => plant.ownerId === currentUser.id) : []
  const due = dueTodos(todos).filter((todo) => canFillTodo(todo, todos))
  const carePlant = careTodo ? plants.find((plant) => plant.id === careTodo.plantId) : undefined

  return (
    <>
      {todoOn && due.length > 0 ? (
        <FeatureGate placement="home.todo" title={t.todo.title}>
          <FloatChip
            id="home-todo"
            label={t.todo.todayTitle}
            defaultPoint={{
              x: typeof window !== 'undefined' ? Math.max(16, window.innerWidth - 96) : 280,
              y: typeof window !== 'undefined' ? window.innerHeight - 300 : 400,
            }}
            face={
              <TodoFace>
                <TodoKindIcon kind="water" size={18} />
                <TodoCount>{due.length}</TodoCount>
              </TodoFace>
            }
          >
            <TodoTable todos={todos} plants={plants} onOpen={(todo) => setCareTodo(todo)} limit={8} />
          </FloatChip>
        </FeatureGate>
      ) : null}

      {careTodo && carePlant ? (
        <TodoCareDialog
          todo={careTodo}
          plant={carePlant}
          todos={todos}
          onClose={() => setCareTodo(undefined)}
          onComplete={(todo) => completeTodo(todo.id)}
          onPickFirstWater={(todo, day) => completeTodo(todo.id, day)}
        />
      ) : null}
    </>
  )
}
