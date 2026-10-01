import { useEffect, useState } from 'react'
import { FloatChip } from '../../../../components/FloatChip/FloatChip'
import { FeatureGate } from '../../../../components/FeatureGate/FeatureGate'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { isFeatureEnabled } from '../../../../theme/release'
import type { Todo } from '../../../../mock/types'
import { GreenhouseLure } from '../GreenhouseLure/GreenhouseLure'
import { TodoTable } from '../../../todo/components/TodoTable/TodoTable'
import { TodoCareDialog } from '../../../todo/components/TodoCareDialog/TodoCareDialog'
import { TodoKindIcon } from '../../../todo/components/TodoKindIcon/TodoKindIcon'
import { canFillTodo, dueTodos } from '../../../todo/todoSchedule'
import { FaceAdd, FaceStack, FaceTile, TodoCount, TodoFace } from './HomeMobileFloats.styles'

const MOBILE_MQ = '(max-width: 899px)'

function useMobileViewport() {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_MQ).matches : false,
  )
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ)
    const onChange = () => setMobile(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return mobile
}

/** Fixed, draggable greenhouse + Needs today chips for the home feed on phones. */
export function HomeMobileFloats() {
  const mobile = useMobileViewport()
  const { t } = useI18n()
  const { db, signedIn, currentUser, completeTodo } = useStore()
  const [careTodo, setCareTodo] = useState<Todo | undefined>()

  if (!mobile) return null

  const ownerId = signedIn && currentUser ? currentUser.id : db.visitorId
  const mine = db.plants.filter((plant) => plant.ownerId === ownerId && plant.photos[0]).slice(0, 3)
  const todoOn = isFeatureEnabled(db.system, 'todo') && signedIn && currentUser
  const todos = todoOn ? db.todos.filter((todo) => todo.ownerId === currentUser.id) : []
  const plants = todoOn ? db.plants.filter((plant) => plant.ownerId === currentUser.id) : []
  const due = dueTodos(todos).filter((todo) => canFillTodo(todo, todos))
  const carePlant = careTodo ? plants.find((plant) => plant.id === careTodo.plantId) : undefined

  const greenhouseFace =
    mine.length > 0 ? (
      <FaceStack>
        {mine.map((plant, index) => (
          <FaceTile key={plant.id} $i={index}>
            <PlantImage src={plant.photos[0]} alt="" />
          </FaceTile>
        ))}
      </FaceStack>
    ) : (
      <FaceStack>
        <FaceAdd $i={0}>+</FaceAdd>
      </FaceStack>
    )

  return (
    <>
      <FloatChip
        id="home-greenhouse"
        label={t.discover.lureEyebrow}
        sheetTitle=""
        defaultPoint={{ x: typeof window !== 'undefined' ? Math.max(16, window.innerWidth - 96) : 280, y: typeof window !== 'undefined' ? window.innerHeight - 200 : 480 }}
        face={greenhouseFace}
      >
        <GreenhouseLure />
      </FloatChip>

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
