import { useEffect, useId, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '../../../../components/Icon/Icon'
import { SkeletonBar } from '../../../../components/Skeleton/Skeleton'
import { useI18n } from '../../../../i18n/I18nProvider'
import { publicGrowerName } from '../../../profile/avatarIcons'
import { fetchGreenhouseLevel } from '../../../../mock/liveApi'
import { useStore } from '../../../../mock/store'
import { useSectionFetch } from '../../../../mock/useServerSlices'
import { clientEnv } from '../../../../theme/plantxEnv'
import { isFeatureEnabled, isPlacementEnabled } from '../../../../theme/release'
import { CARE_XP, LEVEL_RANKS, PLANT_XP, greenhouseLevel, type GreenhouseLevel } from '../../greenhouseLevel'
import { canFillTodo, dueTodos } from '../../../todo/todoSchedule'
import {
  Bar,
  BarFill,
  Blurred,
  Burst,
  Chip,
  Chips,
  Copy,
  DueChip,
  End,
  InfoButton,
  Inner,
  Next,
  Panel,
  PanelRules,
  PlaceButton,
  Rank,
  Root,
  TitleRow,
  TopActions,
  Xp,
} from './GreenhouseLevelCard.styles'
import { LevelBadge } from '../LevelBadge/LevelBadge'

const SEEN_KEY = 'plantx.greenhouseLevel.'

/** Last level this browser showed for the owner, so a rise plays the level-up burst once. */
function readSeen(ownerId: string) {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY + ownerId)
    return raw ? Number(raw) : null
  } catch {
    return null
  }
}

function writeSeen(ownerId: string, level: number) {
  try {
    window.localStorage.setItem(SEEN_KEY + ownerId, String(level))
  } catch {
    // Private mode: the burst may replay, nothing else depends on it.
  }
}

/**
 * Presentational card. `GreenhouseLevelCard` feeds it the owner's live numbers.
 * The ring around the level number is the XP bar; next to it the level name and the XP still needed for the
 * next one. Under it, the same three icon chips at every width: plants, `due` (care needed today, owner only,
 * links to Tasks) and care done. Wide, a thin bar repeats the progress under the name.
 * `owner` + `onOwner` (a grower's public greenhouse) pins their avatar to the ring as a button.
 * `place` (set your greenhouse place, only when it is unknown): wide, a tile at the end; on a phone it waits
 * behind an orange pin in the top row. "?" opens how levels work. AI scans left live in the account dialog.
 */
export function GreenhouseLevelView({
  summary,
  owner,
  celebrate = false,
  place,
  due,
  onOwner,
}: {
  summary: GreenhouseLevel
  owner?: { name: string; color: string; icon?: string }
  celebrate?: boolean
  place?: ReactNode
  /** Plants that need care today (the owner's own greenhouse only). */
  due?: number
  /** Tapping the pinned avatar (a grower's public greenhouse: their profile preview). */
  onOwner?: () => void
}) {
  const { t } = useI18n()
  const [panel, setPanel] = useState<'info' | 'place' | null>(null)
  const panelId = useId()
  const toggle = (next: 'info' | 'place') => setPanel((open) => (open === next ? null : next))
  const rankName = (rank: number) =>
    t.greenhouse[`levelRank${Math.min(rank, LEVEL_RANKS)}` as keyof typeof t.greenhouse] as string
  const left = summary.nextLevelXp - summary.xp
  const toNext = t.greenhouse.levelToNextName
    .replace('{left}', left.toLocaleString())
    .replace('{name}', rankName(summary.rank + 1))

  return (
    <Root aria-label={owner ? `${t.greenhouse.levelLabel} · ${owner.name}` : t.greenhouse.levelLabel} $celebrate={celebrate}>
      {celebrate ? <Burst role="status">{t.greenhouse.levelUp}</Burst> : null}
      <Inner>
        <LevelBadge
          level={summary.level}
          progress={summary.progress}
          owner={onOwner ? owner : undefined}
          onOwner={onOwner}
        />
        <Copy>
          <TitleRow>
            <Rank>{rankName(summary.rank)}</Rank>
            <Xp>
              {t.greenhouse.levelN.replace('{n}', String(summary.level))} ·{' '}
              {t.greenhouse.levelXp.replace('{xp}', summary.xp.toLocaleString())}
            </Xp>
          </TitleRow>
          <Bar aria-hidden>
            <BarFill style={{ width: `${Math.round(summary.progress * 100)}%` }} />
          </Bar>
          <Next>{toNext}</Next>
        </Copy>
        <TopActions>
          {place ? (
            <PlaceButton
              type="button"
              aria-label={t.greenhouse.setPlaceShort}
              title={t.greenhouse.setPlaceShort}
              aria-expanded={panel === 'place'}
              aria-controls={panelId}
              $on={panel === 'place'}
              onClick={() => toggle('place')}
              data-place-button
            >
              <Icon name="pin" size={16} />
            </PlaceButton>
          ) : null}
          <InfoButton
            type="button"
            aria-label={t.greenhouse.levelInfo}
            title={t.greenhouse.levelInfo}
            aria-expanded={panel === 'info'}
            aria-controls={panelId}
            $on={panel === 'info'}
            onClick={() => toggle('info')}
            data-level-info
          >
            ?
          </InfoButton>
        </TopActions>

        <Chips>
          <Chip $tone="plant">
            <Icon name="greenhouse" size={15} />
            {summary.plants === 1
              ? t.greenhouse.levelPlantsOne
              : t.greenhouse.levelPlants.replace('{n}', String(summary.plants))}
          </Chip>
          {due ? (
            <DueChip to="/tasks" data-level-due>
              <Icon name="drop" size={15} />
              {due === 1 ? t.greenhouse.levelDueOne : t.greenhouse.levelDue.replace('{n}', String(due))}
            </DueChip>
          ) : null}
          <Chip $tone="care">
            <Icon name="drop" size={15} />
            {summary.care === 1 ? t.greenhouse.levelCareOne : t.greenhouse.levelCare.replace('{n}', String(summary.care))}
          </Chip>
        </Chips>

        {place ? <End>{place}</End> : null}

        {panel ? (
          <Panel id={panelId}>
            {panel === 'place' ? (
              place
            ) : (
              <PanelRules>
                <li>
                  <strong>{t.greenhouse.levelHow}</strong>
                </li>
                <li>{t.greenhouse.levelEarnPlant.replace('{xp}', String(PLANT_XP))}</li>
                <li>{t.greenhouse.levelEarnCare.replace('{xp}', String(CARE_XP))}</li>
              </PanelRules>
            )}
          </Panel>
        ) : null}
      </Inner>
    </Root>
  )
}

/** The same card with an empty ring and chips: loading for a member, blurred for a guest. No requests. */
export function GreenhouseLevelSkeleton({ blurred = false }: { blurred?: boolean }) {
  const card = (
    <Root aria-hidden $celebrate={false}>
      <Inner>
        <LevelBadge level={1} progress={0} />
        <Copy>
          <SkeletonBar width="110px" height={20} />
          <SkeletonBar width="150px" height={12} />
        </Copy>
        <Chips>
          <SkeletonBar width="80px" height={26} />
          <SkeletonBar width="96px" height={26} />
        </Chips>
      </Inner>
    </Root>
  )
  return blurred ? <Blurred>{card}</Blurred> : card
}

/**
 * A greenhouse level, from plants added and care tasks completed. Hidden when its placement is off.
 * `publicView`: another grower's page. Their tasks never reach this browser, so outside mock mode the
 * numbers come from `GET /api/users/:id/level`, and there is no level-up burst.
 */
export function GreenhouseLevelCard({
  ownerId,
  publicView = false,
  place,
}: {
  ownerId: string
  publicView?: boolean
  place?: ReactNode
}) {
  const { db } = useStore()
  const { locale } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const local = !publicView || clientEnv() === 'mock'
  const fetching = useSectionFetch(local, ['plants', 'todos'])
  const summary = greenhouseLevel(ownerId, db.plants, db.todos)
  // Care needed today, on the owner's own greenhouse only (another grower's tasks never reach this browser).
  const ownTodos =
    publicView || !isFeatureEnabled(db.system, 'todo') ? [] : db.todos.filter((todo) => todo.ownerId === ownerId)
  const due = dueTodos(ownTodos).filter((todo) => canFillTodo(todo, ownTodos)).length
  const [remote, setRemote] = useState<GreenhouseLevel | null>(null)
  const [remoteSettled, setRemoteSettled] = useState(false)
  const [celebrate, setCelebrate] = useState(false)

  useEffect(() => {
    if (local) return
    let cancelled = false
    setRemote(null)
    setRemoteSettled(false)
    void fetchGreenhouseLevel(ownerId).then((res) => {
      if (cancelled) return
      if (res) setRemote(res.level)
      setRemoteSettled(true)
    })
    return () => {
      cancelled = true
    }
  }, [local, ownerId])

  useEffect(() => {
    if (publicView || fetching) return undefined
    const seen = readSeen(ownerId)
    if (seen != null && summary.level > seen) {
      setCelebrate(true)
      const timer = window.setTimeout(() => setCelebrate(false), 4200)
      writeSeen(ownerId, summary.level)
      return () => window.clearTimeout(timer)
    }
    if (seen == null || summary.level !== seen) writeSeen(ownerId, summary.level)
    return undefined
  }, [ownerId, publicView, fetching, summary.level])

  if (!isPlacementEnabled(db.system, 'greenhouse.level')) return place ? <End $loose>{place}</End> : null
  const waiting = local ? fetching : !remoteSettled
  if (waiting) return <GreenhouseLevelSkeleton />
  const shown = local ? summary : remote
  if (!shown) return null
  const user = db.users.find((item) => item.id === ownerId)
  const owner = user
    ? { name: publicGrowerName(user, locale === 'he'), color: user.avatarColor, icon: user.avatarIcon }
    : undefined
  // On a grower's public greenhouse the avatar opens the same user preview as a feed avatar (#84).
  const openProfile = publicView
    ? () =>
        navigate(
          { pathname: location.pathname, search: location.search, hash: location.hash },
          { state: { profilePreview: ownerId } },
        )
    : undefined
  return (
    <GreenhouseLevelView
      summary={shown}
      owner={owner}
      celebrate={celebrate}
      place={place}
      due={due}
      onOwner={owner ? openProfile : undefined}
    />
  )
}
