import { OTHER_CATEGORY_ID } from '../../plantClass'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { isPlacementEnabled, isPlacementReady } from '../../../../theme/release'
import { isPhotoStale, isWaterDue } from '../../plantCare'
import type { Plant, Todo } from '../../../../mock/types'
import {
  dueTodos,
  isFirstWaterTodo,
  upcomingTodos,
} from '../../../todo/todoSchedule'
import { TodoKindIcon } from '../../../todo/components/TodoKindIcon/TodoKindIcon'
import { PlantCatalogMark } from '../CatalogMark/CatalogMark'
import { IdentifyBadge } from '../IdentifyBadge/IdentifyBadge'
import {
  CareAction,
  CareActions,
  CareDate,
  CareName,
  CollectionGrid,
  Details,
  Name,
  NameRow,
  PassportMark,
  Photo,
  PhotoCount,
  PhotoLink,
  Root,
  StatusMark,
  Tags,
} from './GreenhousePlantCard.styles'

export { CollectionGrid }

function statusFor(
  plant: Plant,
  marketOpen: boolean,
  todos: Todo[],
  t: ReturnType<typeof useI18n>['t'],
): { label: string; tone: 'warm' | 'fresh' | 'calm' | 'due' } {
  if (isWaterDue(plant, todos)) return { label: t.greenhouse.badgeWaterDue, tone: 'due' }
  if (isPhotoStale(plant, todos)) return { label: t.greenhouse.badgePhotoDue, tone: 'due' }
  if (plant.status === 'listed') {
    return {
      label: marketOpen ? t.greenhouse.cardListed : t.greenhouse.pendingMarket,
      tone: 'fresh',
    }
  }
  return { label: t.greenhouse.badgeGrowing, tone: 'calm' }
}

function formatCareDay(iso: string | null, locale: string) {
  if (!iso) return null
  return new Date(`${iso}T12:00:00.000Z`).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/** Shelf card. Care filters show name + action + date; the whole card opens the care popup. */
export function GreenhousePlantCard({
  plant,
  fresh,
  careKind,
  careScope = 'due',
  onCare,
  preview,
}: {
  plant: Plant
  /** Just added: the card glows once. */
  fresh?: boolean
  /** Needs care / Upcoming section: show only this action under the name. */
  careKind?: 'water' | 'photo'
  /** `due` = Needs care; `upcoming` = scheduled later. */
  careScope?: 'due' | 'upcoming'
  /** Care filter: open the day popup for this todo instead of navigating. */
  onCare?: (todo: Todo) => void
  /** Activity popup: same card, name stays visible, and it does not navigate. */
  preview?: boolean
}) {
  const { db } = useStore()
  const { t, tr, locale } = useI18n()
  const marketOpen = isPlacementReady(db.system, 'market.board')
  const cardOn = isPlacementEnabled(db.system, 'greenhouse.card')
  if (!cardOn) return null

  const todos = db.todos.filter((todo) => todo.plantId === plant.id)
  const carePool = careScope === 'upcoming' ? upcomingTodos(todos) : dueTodos(todos)
  const needed = careKind ? carePool.filter((todo) => todo.subcategory === careKind) : []
  const primary = needed[0]
  const status = statusFor(plant, marketOpen, todos, t)
  const verified = Boolean(plant.verifiedAt)
  const photos = plant.photos.filter(Boolean)
  const careMode = Boolean(careKind)
  const dayLabel = primary ? formatCareDay(primary.dueOn, locale) : null

  const openCare = () => {
    if (!primary || !onCare) return
    onCare(primary)
  }

  return (
    <Root
      $fresh={fresh}
      $care={careMode}
      $living={status.tone === 'calm'}
      onClick={careMode ? openCare : undefined}
      onKeyDown={
        careMode
          ? (event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              openCare()
            }
          : undefined
      }
      role={careMode ? 'button' : undefined}
      tabIndex={careMode ? 0 : undefined}
    >
      {careMode || preview ? (
        <Photo $stale={isPhotoStale(plant, todos)}>
          <PlantImage src={photos[0]} alt="" />
          <StatusMark $tone={status.tone}>{status.label}</StatusMark>
          {dayLabel ? <CareDate>{dayLabel}</CareDate> : null}
          {photos.length > 1 ? (
            <PhotoCount title={t.addPlant.photosCount.replace('{n}', String(photos.length))}>
              <span aria-hidden>▣</span> +{photos.length - 1}
            </PhotoCount>
          ) : null}
        </Photo>
      ) : (
        <PhotoLink to={`/plants/${plant.id}`} aria-haspopup="dialog">
          <Photo $stale={isPhotoStale(plant, todos)}>
            <PlantImage src={photos[0]} alt="" />
            <StatusMark $tone={status.tone}>{status.label}</StatusMark>
            {photos.length > 1 ? (
              <PhotoCount title={t.addPlant.photosCount.replace('{n}', String(photos.length))}>
                <span aria-hidden>▣</span> +{photos.length - 1}
              </PhotoCount>
            ) : null}
          </Photo>
        </PhotoLink>
      )}
      <Details $care={careMode} $preview={preview}>
        <NameRow>
          <PlantCatalogMark plant={plant} size={24} />
          {careMode || preview ? (
            <CareName>{tr(plant.title, plant.titleHe)}</CareName>
          ) : (
            <Name to={`/plants/${plant.id}`}>{tr(plant.title, plant.titleHe)}</Name>
          )}
        </NameRow>
        {careMode ? (
          <CareActions>
            {needed.map((todo) => {
              const first = isFirstWaterTodo(todo, todos)
              const label =
                todo.subcategory === 'photo'
                  ? t.todo.actionPhoto
                  : first
                    ? t.todo.actionSetWaterDate
                    : t.todo.actionWater
              const when = formatCareDay(todo.dueOn, locale)
              return (
                <CareAction key={todo.id} $tone={todo.subcategory === 'photo' ? 'photo' : 'water'}>
                  <TodoKindIcon kind={todo.subcategory} size={14} />
                  <span>
                    {label}
                    {when ? ` · ${when}` : ''}
                  </span>
                </CareAction>
              )
            })}
          </CareActions>
        ) : (
          <Tags>
            <IdentifyBadge identification={plant.identification} notInCatalog={plant.speciesId === OTHER_CATEGORY_ID} compact />
            {verified ? <PassportMark>✓ {t.greenhouse.passportOk}</PassportMark> : null}
          </Tags>
        )}
      </Details>
    </Root>
  )
}
