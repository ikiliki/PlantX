import { useState } from 'react'
import { FeatureGate } from '../../../../components/FeatureGate/FeatureGate'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { isFeatureEnabled } from '../../../../theme/release'
import type { Todo } from '../../../../mock/types'
import { publicGrowerName } from '../../../profile/avatarIcons'
import { FeedUpdate } from '../../../feed/components/FeedUpdate/FeedUpdate'
import { MarketRail } from '../../../feed/components/MarketRail/MarketRail'
import { RankRail } from '../../../feed/components/RankRail/RankRail'
import { useHomeFeed } from '../../../feed/useHomeFeed'
import { AddPlantDialog } from '../../../greenhouse/components/AddPlantDialog/AddPlantDialog'
import { greenhouseLevel } from '../../../greenhouse/greenhouseLevel'
import { TodoCareDialog } from '../../../todo/components/TodoCareDialog/TodoCareDialog'
import { TodoTable } from '../../../todo/components/TodoTable/TodoTable'
import { canFillTodo, dueTodos } from '../../../todo/todoSchedule'
import {
  Calm,
  First,
  FirstAction,
  FirstBody,
  FirstTitle,
  Greeting,
  Head,
  HeadLink,
  HeadTitle,
  Hello,
  More,
  PlantCard,
  PlantName,
  PlantPhoto,
  Root,
  Section,
  Strip,
  Summary,
} from './HomeToday.styles'

/** Rows stop short so Home never scrolls forever; each has a link to the full page. */
const STRIP = 6
const FEED_PREVIEW = 2

function greetingKey(hour: number) {
  if (hour < 12) return 'morning' as const
  if (hour < 18) return 'afternoon' as const
  return 'evening' as const
}

/**
 * Home on a phone for a signed-in grower: a greeting with today's count, today's care, the grower's own
 * plants, then short market, rank and feed sections. Desktop keeps the three-column Home.
 */
export function HomeToday() {
  const { t, tr, locale } = useI18n()
  const { db, currentUser, completeTodo } = useStore()
  const { items } = useHomeFeed()
  const [careTodo, setCareTodo] = useState<Todo | undefined>()
  const [adding, setAdding] = useState(false)

  if (!currentUser) return null

  const plants = db.plants.filter((plant) => plant.ownerId === currentUser.id)
  const todoOn = isFeatureEnabled(db.system, 'todo')
  const todos = todoOn ? db.todos.filter((todo) => todo.ownerId === currentUser.id) : []
  const due = dueTodos(todos).filter((todo) => canFillTodo(todo, todos))
  const level = greenhouseLevel(currentUser.id, db.plants, db.todos).level
  const name = publicGrowerName(currentUser, locale === 'he')
  const carePlant = careTodo ? plants.find((plant) => plant.id === careTodo.plantId) : undefined

  const summary =
    plants.length === 0 || !todoOn
      ? null
      : due.length === 0
        ? t.homeToday.summaryCalm
        : due.length === 1
          ? t.homeToday.summaryOneDue
          : t.homeToday.summaryDue.replace('{n}', String(due.length))

  return (
    <Root data-home-today>
      <Hello>
        <Greeting>{t.homeToday[greetingKey(new Date().getHours())].replace('{name}', name)}</Greeting>
        <Summary>
          {summary ? `${summary} · ` : ''}
          {t.homeToday.level.replace('{n}', String(level))}
        </Summary>
      </Hello>

      {plants.length === 0 ? (
        <First data-home-first>
          <FirstTitle>{t.homeToday.firstTitle}</FirstTitle>
          <FirstBody>{t.homeToday.firstBody}</FirstBody>
          <FirstAction type="button" onClick={() => setAdding(true)}>
            {t.homeToday.firstAction}
          </FirstAction>
        </First>
      ) : (
        <>
          {todoOn ? (
            <FeatureGate placement="home.todo" title={t.todo.title}>
              <Section data-home-care>
                {due.length === 0 ? (
                  <Calm>{t.homeToday.careDone}</Calm>
                ) : (
                  <>
                    <TodoTable todos={todos} plants={plants} onOpen={setCareTodo} limit={3} />
                    <More to="/tasks">{t.homeToday.careAll}</More>
                  </>
                )}
              </Section>
            </FeatureGate>
          ) : null}

          <Section data-home-greenhouse>
            <Head>
              <HeadTitle>{t.homeToday.greenhouse}</HeadTitle>
              <HeadLink to="/greenhouse">{t.homeToday.greenhouseAll.replace('{n}', String(plants.length))}</HeadLink>
            </Head>
            <Strip>
              {plants.slice(0, STRIP).map((plant) => (
                <PlantCard key={plant.id} to={`/plants/${plant.id}`}>
                  <PlantPhoto>
                    <PlantImage src={plant.photos[0]} alt="" />
                  </PlantPhoto>
                  <PlantName>{tr(plant.title, plant.titleHe)}</PlantName>
                </PlantCard>
              ))}
            </Strip>
          </Section>
        </>
      )}

      <Section data-home-market>
        <MarketRail />
      </Section>

      <Section data-home-rank>
        <RankRail />
      </Section>

      <FeatureGate placement="home.feed" title={t.nav.feed}>
        <Section data-home-feed>
          <Head>
            <HeadTitle>{t.homeToday.feed}</HeadTitle>
            <HeadLink to="/feed">{t.homeToday.feedAll}</HeadLink>
          </Head>
          {items.length === 0 ? <Calm>{t.feed.empty}</Calm> : null}
          {items.slice(0, FEED_PREVIEW).map((item) => (
            <FeedUpdate key={item.id} update={item.update} />
          ))}
        </Section>
      </FeatureGate>

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
      {adding ? <AddPlantDialog onClose={() => setAdding(false)} /> : null}
    </Root>
  )
}
