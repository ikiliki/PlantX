import { useEffect, useId, useState, type CSSProperties } from 'react'
import { Avatar } from '../../../../components/Avatar/Avatar'
import { useI18n } from '../../../../i18n/I18nProvider'
import { fetchGreenhouseLevel } from '../../../../mock/liveApi'
import { useStore } from '../../../../mock/store'
import { clientEnv } from '../../../../theme/plantxEnv'
import { isPlacementEnabled } from '../../../../theme/release'
import { CARE_XP, PLANT_XP, greenhouseLevel, type GreenhouseLevel } from '../../greenhouseLevel'
import {
  Bar,
  BarFill,
  Burst,
  How,
  HowList,
  Inner,
  Label,
  Next,
  OwnerBadge,
  Progress,
  Rank,
  Ring,
  RingNumber,
  RingWrap,
  Root,
  Tally,
  TallyRow,
  Top,
  TopCopy,
  Xp,
} from './GreenhouseLevelCard.styles'

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
 */
export function GreenhouseLevelView({
  summary,
  owner,
  celebrate = false,
}: {
  summary: GreenhouseLevel
  owner?: { name: string; color: string }
  celebrate?: boolean
}) {
  const { t } = useI18n()
  const [howOpen, setHowOpen] = useState(false)
  const howId = useId()
  const rankName = t.greenhouse[`levelRank${summary.rank}` as keyof typeof t.greenhouse] as string
  const left = summary.nextLevelXp - summary.xp

  return (
    <Root aria-label={owner ? `${t.greenhouse.levelLabel} · ${owner.name}` : t.greenhouse.levelLabel} $celebrate={celebrate}>
      {celebrate ? <Burst role="status">{t.greenhouse.levelUp}</Burst> : null}
      <Inner>
      <Top>
        <RingWrap>
          <Ring
            role="img"
            aria-label={t.greenhouse.levelN.replace('{n}', String(summary.level))}
            style={{ '--progress': summary.progress } as CSSProperties}
          >
            <RingNumber>{summary.level}</RingNumber>
          </Ring>
          {owner ? (
            <OwnerBadge title={owner.name}>
              <Avatar name={owner.name} color={owner.color} size={28} />
            </OwnerBadge>
          ) : null}
        </RingWrap>
        <TopCopy>
          <Label>{t.greenhouse.levelLabel}</Label>
          <Rank>{rankName}</Rank>
          <Xp>
            {t.greenhouse.levelN.replace('{n}', String(summary.level))} ·{' '}
            {t.greenhouse.levelXp.replace('{xp}', summary.xp.toLocaleString())}
          </Xp>
        </TopCopy>
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
      </Top>

      <Progress>
        <Bar aria-hidden>
          <BarFill style={{ width: `${Math.round(summary.progress * 100)}%` }} />
        </Bar>
        <Next>
          {t.greenhouse.levelToNext
            .replace('{left}', left.toLocaleString())
            .replace('{n}', String(summary.level + 1))}
        </Next>
      </Progress>

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

      {howOpen ? (
        <HowList id={howId}>
          <li>
            <strong>{t.greenhouse.levelHow}</strong>
          </li>
          <li>{t.greenhouse.levelEarnPlant.replace('{xp}', String(PLANT_XP))}</li>
          <li>{t.greenhouse.levelEarnCare.replace('{xp}', String(CARE_XP))}</li>
        </HowList>
      ) : null}
      </Inner>
    </Root>
  )
}

/**
 * A greenhouse level, from plants added and care tasks completed. Hidden when its placement is off.
 * `publicView`: another grower's page. Their tasks never reach this browser, so outside mock mode the
 * numbers come from `GET /api/users/:id/level`, and there is no level-up burst.
 */
export function GreenhouseLevelCard({ ownerId, publicView = false }: { ownerId: string; publicView?: boolean }) {
  const { db } = useStore()
  const local = !publicView || clientEnv() === 'mock'
  const summary = greenhouseLevel(ownerId, db.plants, db.todos)
  const [remote, setRemote] = useState<GreenhouseLevel | null>(null)
  const [celebrate, setCelebrate] = useState(false)

  useEffect(() => {
    if (local) return
    let cancelled = false
    setRemote(null)
    void fetchGreenhouseLevel(ownerId).then((res) => {
      if (!cancelled && res) setRemote(res.level)
    })
    return () => {
      cancelled = true
    }
  }, [local, ownerId])

  useEffect(() => {
    if (publicView) return undefined
    const seen = readSeen(ownerId)
    if (seen != null && summary.level > seen) {
      setCelebrate(true)
      const timer = window.setTimeout(() => setCelebrate(false), 4200)
      writeSeen(ownerId, summary.level)
      return () => window.clearTimeout(timer)
    }
    if (seen == null || summary.level !== seen) writeSeen(ownerId, summary.level)
    return undefined
  }, [ownerId, publicView, summary.level])

  if (!isPlacementEnabled(db.system, 'greenhouse.level')) return null
  const shown = local ? summary : remote
  if (!shown) return null
  const user = db.users.find((item) => item.id === ownerId)
  const owner = user ? { name: user.name, color: user.avatarColor } : undefined
  return <GreenhouseLevelView summary={shown} owner={owner} celebrate={celebrate} />
}
