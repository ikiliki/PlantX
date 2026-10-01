import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Icon } from '../../../../components/Icon/Icon'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { RarityChip } from '../../../../components/RarityChip/RarityChip'
import { useAuth } from '../../../auth/AuthProvider'
import { useI18n } from '../../../../i18n/I18nProvider'
import { factsForPlant } from '../../../../mock/plantFacts'
import { useStore } from '../../../../mock/store'
import type { CommunityGradeLetter, GradeStackScenario, Plant } from '../../../../mock/types'
import { FEW_GRADE_CARDS, SWIPE_THRESHOLD, selectGradeQueue, swipeLetter } from '../../communityGrade'
import {
  ActionButton,
  Actions,
  Behind,
  Body,
  Card,
  CountPill,
  Deck,
  Direction,
  EmptyCard,
  Footer,
  Frame,
  Hint,
  InfoLink,
  Meta,
  MetaPill,
  Name,
  NextCard,
  Overlay,
  Photo,
  Segment,
  Segments,
  TextLink,
  Tint,
  UndoButton,
  VisuallyHidden,
  type Side,
  type StackVariant,
} from './GradeStack.styles'

const SIDES: { side: Side; letter: CommunityGradeLetter }[] = [
  { side: 'up', letter: 'S' },
  { side: 'right', letter: 'A' },
  { side: 'down', letter: 'B' },
  { side: 'left', letter: 'C' },
]

const KEYS: Record<string, CommunityGradeLetter> = {
  ArrowUp: 'S',
  ArrowRight: 'A',
  ArrowDown: 'B',
  ArrowLeft: 'C',
}

const ACTIONS: { letter: CommunityGradeLetter; side: Side; arrow: string; big?: boolean }[] = [
  { letter: 'C', side: 'left', arrow: '←', big: true },
  { letter: 'B', side: 'down', arrow: '↓' },
  { letter: 'S', side: 'up', arrow: '↑' },
  { letter: 'A', side: 'right', arrow: '→', big: true },
]

const FLY_MS = 360
const TAP_SLOP = 6

function exitFor(letter: CommunityGradeLetter, from: { x: number; y: number }) {
  const w = typeof window === 'undefined' ? 800 : window.innerWidth
  const h = typeof window === 'undefined' ? 800 : window.innerHeight
  if (letter === 'S') return { x: from.x * 1.5, y: -h * 1.1 }
  if (letter === 'B') return { x: from.x * 1.5, y: h * 1.1 }
  return { x: (letter === 'A' ? 1 : -1) * w * 1.1, y: from.y + 60 }
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
}

function capFor(scenario: GradeStackScenario) {
  if (scenario === 'empty') return 0
  if (scenario === 'one') return 1
  if (scenario === 'few') return FEW_GRADE_CARDS
  return Number.POSITIVE_INFINITY
}

type GradedEntry = { plantId: string; letter: CommunityGradeLetter }

export type GradeQueue = {
  queue: Plant[]
  last: (GradedEntry & { plant?: Plant }) | null
  grade: (plantId: string, letter: CommunityGradeLetter) => void
  undo: () => void
}

/** Everything published from a greenhouse that this person has not graded yet. */
export function useGradeQueue(): GradeQueue {
  const { db, currentUser, signedIn, gradePlant, ungradePlant } = useStore()
  const actor = signedIn && currentUser ? currentUser.id : db.visitorId
  const scenario = db.flags.gradeStack
  const [session, setSession] = useState<{ scenario: GradeStackScenario; history: GradedEntry[]; restored: string | null }>(
    { scenario, history: [], restored: null },
  )
  if (session.scenario !== scenario) setSession({ scenario, history: [], restored: null })
  const history = session.scenario === scenario ? session.history : []
  const open = selectGradeQueue(db.plants, 'full', actor)
  const restored = open.findIndex((plant) => plant.id === session.restored)
  if (restored > 0) open.unshift(...open.splice(restored, 1))
  const remaining = Math.max(0, capFor(scenario) - history.length)
  const lastEntry = history.at(-1) ?? null

  return {
    queue: open.slice(0, remaining),
    last: lastEntry ? { ...lastEntry, plant: db.plants.find((plant) => plant.id === lastEntry.plantId) } : null,
    grade: (plantId, letter) => {
      gradePlant(plantId, letter)
      setSession((current) => ({ ...current, history: [...current.history, { plantId, letter }], restored: null }))
    },
    undo: () => {
      if (!lastEntry) return
      ungradePlant(lastEntry.plantId)
      setSession((current) => ({ ...current, history: current.history.slice(0, -1), restored: lastEntry.plantId }))
    },
  }
}

function CardFace({ plant, variant, interactive }: { plant: Plant; variant: StackVariant; interactive?: boolean }) {
  const { db } = useStore()
  const { t, tr } = useI18n()
  const species = db.species.find((item) => item.id === plant.speciesId)
  const { rarity } = factsForPlant(plant, db.species)
  const graded = plant.grades?.length ?? 0
  return (
    <Overlay>
      <Body>
        <Name $variant={variant}>{tr(plant.title, plant.titleHe)}</Name>
        <Meta>
          <RarityChip rarity={rarity} />
          {species && <MetaPill>{tr(species.commonName, species.commonNameHe)}</MetaPill>}
          <MetaPill>{graded > 0 ? t.grade.count.replace('{n}', String(graded)) : t.grade.none}</MetaPill>
        </Meta>
      </Body>
      {interactive && (
        <InfoLink to={`/plants/${plant.id}`} data-no-drag="" aria-label={t.grade.openPassport} title={t.grade.openPassport}>
          <Icon name="arrowUp" size={20} />
        </InfoLink>
      )}
    </Overlay>
  )
}

export function GradeStack({ grading, variant = 'tab' }: { grading: GradeQueue; variant?: StackVariant }) {
  const { signedIn } = useStore()
  const { openAuth } = useAuth()
  const { t, tr } = useI18n()
  const { queue, last, grade, undo } = grading
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [leaving, setLeaving] = useState<CommunityGradeLetter | null>(null)
  const [fired, setFired] = useState<CommunityGradeLetter | null>(null)
  const [photo, setPhoto] = useState<{ id: string; index: number }>({ id: '', index: 0 })
  const start = useRef<{ x: number; y: number; id: number } | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const firedTimer = useRef<number | undefined>(undefined)

  const top = queue[0]
  const next = queue[1]
  const preview = leaving ?? swipeLetter(offset.x, offset.y)
  const photos = top?.photos.length ? top.photos : ['']
  const photoIndex = top && photo.id === top.id ? Math.min(photo.index, photos.length - 1) : 0

  const commit = (letter: CommunityGradeLetter) => {
    if (!top || leaving) return
    window.clearTimeout(firedTimer.current)
    setFired(letter)
    firedTimer.current = window.setTimeout(() => setFired(null), 400)
    if (!signedIn) {
      setOffset({ x: 0, y: 0 })
      const plantId = top.id
      openAuth('rank', () => grade(plantId, letter))
      return
    }
    setLeaving(letter)
    setOffset((current) => exitFor(letter, current))
    timer.current = window.setTimeout(() => {
      grade(top.id, letter)
      setLeaving(null)
      setOffset({ x: 0, y: 0 })
    }, FLY_MS)
  }

  const onUndo = () => {
    if (leaving) return
    undo()
  }

  const commitRef = useRef(commit)
  commitRef.current = commit

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const letter = KEYS[event.key]
      if (!letter || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
      if (isTyping(event.target) || document.querySelector('[role="dialog"]')) return
      event.preventDefault()
      commitRef.current(letter)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(
    () => () => {
      window.clearTimeout(timer.current)
      window.clearTimeout(firedTimer.current)
    },
    [],
  )

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (leaving || event.button > 0) return
    if ((event.target as HTMLElement).closest('[data-no-drag]')) return
    event.currentTarget.setPointerCapture(event.pointerId)
    start.current = { x: event.clientX, y: event.clientY, id: event.pointerId }
    setDragging(true)
  }

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const origin = start.current
    if (!origin || origin.id !== event.pointerId) return
    setOffset({ x: event.clientX - origin.x, y: event.clientY - origin.y })
  }

  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    const origin = start.current
    if (!origin || origin.id !== event.pointerId) return
    start.current = null
    setDragging(false)
    const dx = event.clientX - origin.x
    const dy = event.clientY - origin.y
    if (top && event.type === 'pointerup' && Math.hypot(dx, dy) < TAP_SLOP && photos.length > 1) {
      const rect = event.currentTarget.getBoundingClientRect()
      const step = event.clientX < rect.left + rect.width / 2 ? -1 : 1
      setPhoto({ id: top.id, index: (photoIndex + step + photos.length) % photos.length })
    }
    const letter = swipeLetter(dx, dy)
    if (letter) commit(letter)
    else setOffset({ x: 0, y: 0 })
  }

  const undoControl = last && (
    <UndoButton
      type="button"
      onClick={onUndo}
      disabled={Boolean(leaving)}
      title={t.grade.undo}
      aria-label={t.grade.undoLast.replace('{g}', last.letter).replace('{name}', last.plant ? tr(last.plant.title, last.plant.titleHe) : '')}
    >
      <span aria-hidden>↶</span>
      <VisuallyHidden>{t.grade.undo}</VisuallyHidden>
    </UndoButton>
  )

  if (!top) {
    return (
      <Frame>
        <Deck $variant={variant}>
          <EmptyCard role="status">
            <strong>{t.grade.empty}</strong>
            <span>{t.grade.emptyHint}</span>
            {variant === 'page' && <TextLink to="/greenhouse">{t.grade.backToGreenhouse}</TextLink>}
          </EmptyCard>
        </Deck>
        {undoControl && <Footer>{undoControl}</Footer>}
      </Frame>
    )
  }

  const distance = Math.max(Math.abs(offset.x), Math.abs(offset.y))
  const progress = leaving ? 1 : clamp01(distance / SWIPE_THRESHOLD)
  const rotate = Math.max(-18, Math.min(18, offset.x / 14))
  const pull: Record<Side, number> = {
    up: clamp01(-offset.y / SWIPE_THRESHOLD),
    right: clamp01(offset.x / SWIPE_THRESHOLD),
    down: clamp01(offset.y / SWIPE_THRESHOLD),
    left: clamp01(-offset.x / SWIPE_THRESHOLD),
  }
  const lead = SIDES.reduce((best, item) => (pull[item.side] > pull[best.side] ? item : best), SIDES[0])
  const pullFor = (letter: CommunityGradeLetter, side: Side) => {
    if (leaving) return leaving === letter ? 1 : 0
    return lead.letter === letter ? pull[side] : 0
  }

  return (
    <Frame>
      <Deck
        $variant={variant}
        tabIndex={0}
        role="group"
        aria-roledescription="card stack"
        aria-label={`${tr(top.title, top.titleHe)}. ${t.grade.hint}`}
      >
        {queue[2] && <Behind aria-hidden />}
        {next && (
          <NextCard
            key={next.id}
            aria-hidden
            data-grade-next={next.id}
            style={{ transform: `translateY(${18 * (1 - progress)}px) scale(${0.93 + 0.07 * progress})` }}
          >
            <Photo>
              <PlantImage src={next.photos[0]} alt="" />
            </Photo>
            <CardFace plant={next} variant={variant} />
          </NextCard>
        )}
        <Card
          key={top.id}
          data-grade-card={top.id}
          $animate={!dragging}
          $leaving={Boolean(leaving)}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) rotate(${leaving ? rotate * 1.4 : rotate}deg)`,
            opacity: leaving ? 0 : 1,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <Photo>
            <PlantImage src={photos[photoIndex]} alt="" draggable={false} />
          </Photo>
          {photos.length > 1 && (
            <Segments aria-hidden>
              {photos.map((src, index) => (
                <Segment key={`${src}-${index}`} $on={index === photoIndex} />
              ))}
            </Segments>
          )}
          <CountPill>{t.grade.left.replace('{n}', String(queue.length))}</CountPill>
          <Tint aria-hidden $letter={preview} style={{ opacity: preview ? 0.35 + 0.35 * progress : 0 }} />
          {SIDES.map(({ side, letter }) => {
            const amount = preview === letter ? Math.max(progress, pull[side]) : pull[side]
            return (
              <Direction
                key={side}
                $side={side}
                $letter={letter}
                aria-hidden
                data-direction={letter}
                style={{ opacity: preview === letter ? 1 : amount, ['--pop' as string]: String(0.6 + 0.4 * amount) }}
              >
                {letter}
              </Direction>
            )
          })}
          <CardFace plant={top} variant={variant} interactive />
        </Card>
      </Deck>
      <Actions dir="ltr" role="group" aria-label={t.grade.buttons}>
        {undoControl}
        {ACTIONS.map(({ letter, side, arrow, big }) => (
          <ActionButton
            key={letter}
            type="button"
            $letter={letter}
            $big={big}
            $pull={pullFor(letter, side)}
            $fired={fired === letter}
            aria-label={t.grade.gradeAs.replace('{g}', letter)}
            onClick={() => commit(letter)}
          >
            <strong>{letter}</strong>
            <small aria-hidden>{arrow}</small>
          </ActionButton>
        ))}
      </Actions>
      {last?.plant && (
        <Footer>
          <span>
            {t.grade.lastGraded.replace('{g}', last.letter).replace('{name}', tr(last.plant.title, last.plant.titleHe))}
          </span>
        </Footer>
      )}
      <Hint>
        {t.grade.hint} {t.grade.anonymous}
      </Hint>
    </Frame>
  )
}
