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
import { isPlacementEnabled } from '../../../../theme/release'
import { CARE_XP, PLANT_XP, greenhouseLevel, type GreenhouseLevel } from '../../greenhouseLevel'
import {
  Bar,
  BarFill,
  Blurred,
  Burst,
  End,
  How,
  HowList,
  InfoButton,
  Panel,
  PanelRules,
  PlaceButton,
  TopActions,
  Inner,
  Next,
  Progress,
  Rank,
  Root,
  Side,
  Tally,
  TallyRow,
  Top,
  TopCopy,
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
 * `owner` puts the grower's avatar on the level ring; the card is the page's header, so no name is shown.
 * The owner's own tiles: `scans` (AI scans left) and `place` (set your greenhouse place, only when it is unknown).
 * Wide, they stand in a column at the end of the card. On a phone they wait behind two buttons in the top row:
 * "!" opens the scans and the level rules (it replaces the (?) after the XP line), and an orange pin, only
 * when the place is missing, opens the place tile.
 */
export function GreenhouseLevelView({
  summary,
  owner,
  celebrate = false,
  scans,
  place,
  onOwner,
}: {
  summary: GreenhouseLevel
  owner?: { name: string; color: string; icon?: string }
  celebrate?: boolean
  scans?: ReactNode
  place?: ReactNode
  /** Tapping the pinned avatar (a grower's public greenhouse: their profile preview). */
  onOwner?: () => void
}) {
  const { t } = useI18n()
  const [howOpen, setHowOpen] = useState(false)
  const [panel, setPanel] = useState<'info' | 'place' | null>(null)
  const howId = useId()
  const panelId = useId()
  const toggle = (next: 'info' | 'place') => setPanel((open) => (open === next ? null : next))
  const rules = (
    <>
      <li>
        <strong>{t.greenhouse.levelHow}</strong>
      </li>
      <li>{t.greenhouse.levelEarnPlant.replace('{xp}', String(PLANT_XP))}</li>
      <li>{t.greenhouse.levelEarnCare.replace('{xp}', String(CARE_XP))}</li>
    </>
  )
  const rankName = t.greenhouse[`levelRank${summary.rank}` as keyof typeof t.greenhouse] as string
  const left = summary.nextLevelXp - summary.xp

  return (
    <Root aria-label={owner ? `${t.greenhouse.levelLabel} · ${owner.name}` : t.greenhouse.levelLabel} $celebrate={celebrate}>
      {celebrate ? <Burst role="status">{t.greenhouse.levelUp}</Burst> : null}
      <Inner>
      <Top>
        <LevelBadge level={summary.level} progress={summary.progress} owner={owner} onOwner={onOwner} />
        <TopCopy>
          <Rank>{rankName}</Rank>
          <Xp>
            {t.greenhouse.levelN.replace('{n}', String(summary.level))} ·{' '}
            {t.greenhouse.levelXp.replace('{xp}', summary.xp.toLocaleString())}
          </Xp>
        </TopCopy>
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
      </Top>

      <Progress>
        <Bar aria-hidden>
          <BarFill style={{ width: `${Math.round(summary.progress * 100)}%` }} />
        </Bar>
        <Next>
          {t.greenhouse.levelToNext
            .replace('{left}', left.toLocaleString())
            .replace('{n}', String(summary.level + 1))}
          <How
            type="button"
            aria-label={t.greenhouse.levelHow}
            title={t.greenhouse.levelHow}
            aria-expanded={howOpen}
            aria-controls={howId}
            $on={howOpen}
            onClick={() => setHowOpen((open) => !open)}
          >
            ?
          </How>
        </Next>
      </Progress>

      <Side>
      <TallyRow>
        <Tally $tone="plant">
          <span aria-hidden>🌱</span>
          {summary.plants === 1 ? t.greenhouse.levelPlantsOne : t.greenhouse.levelPlants.replace('{n}', String(summary.plants))}
        </Tally>
        <Tally $tone="care">
          <span aria-hidden>💧</span>
          {summary.care === 1 ? t.greenhouse.levelCareOne : t.greenhouse.levelCare.replace('{n}', String(summary.care))}
        </Tally>
      </TallyRow>
      </Side>

      {scans || place ? (
        <End>
          {scans}
          {place}
        </End>
      ) : null}

      {panel ? (
        <Panel id={panelId}>
          {panel === 'place' ? (
            place
          ) : (
            <>
              {scans}
              <PanelRules>{rules}</PanelRules>
            </>
          )}
        </Panel>
      ) : null}

      {howOpen ? <HowList id={howId}>{rules}</HowList> : null}
      </Inner>
    </Root>
  )
}

/** The same card with an empty ring and bars: loading for a member, blurred for a guest. No requests. */
export function GreenhouseLevelSkeleton({ blurred = false }: { blurred?: boolean }) {
  const card = (
    <Root aria-hidden $celebrate={false}>
      <Inner>
        <Top>
          <LevelBadge level={1} progress={0} />
          <TopCopy>
            <SkeletonBar width="90px" height={18} />
            <SkeletonBar width="130px" height={12} />
          </TopCopy>
        </Top>
        <Progress>
          <Bar aria-hidden />
          <SkeletonBar width="110px" height={10} />
        </Progress>
        <Side>
          <TallyRow>
            <SkeletonBar width="80px" height={26} />
            <SkeletonBar width="96px" height={26} />
          </TallyRow>
        </Side>
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
  scans,
  place,
}: {
  ownerId: string
  publicView?: boolean
  scans?: ReactNode
  place?: ReactNode
}) {
  const { db } = useStore()
  const { locale } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const local = !publicView || clientEnv() === 'mock'
  const fetching = useSectionFetch(local, ['plants', 'todos'])
  const summary = greenhouseLevel(ownerId, db.plants, db.todos)
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

  if (!isPlacementEnabled(db.system, 'greenhouse.level')) return scans || place ? (
      <End $loose>
        {scans}
        {place}
      </End>
    ) : null
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
      scans={scans}
      place={place}
      onOwner={owner ? openProfile : undefined}
    />
  )
}
