import { useEffect, useRef, useState } from 'react'
import { InfiniteSentinel, useInfiniteList } from '../../../../components/InfiniteScroll/InfiniteScroll'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { Segmented } from '../../../../components/Segmented/Segmented'
import { isPublicActivity } from '../../../feed/activityXp'
import { useGreenhouseSocial } from '../../useGreenhouseSocial'
import { ActivityMoment, MomentGlyph } from '../../../feed/components/ActivityMoment/ActivityMoment'
import { XpChip } from '../../../feed/components/XpChip/XpChip'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { FeedUpdateKind } from '../../../../mock/types'
import {
  Badge,
  Day,
  DayLabel,
  Empty,
  Head,
  Label,
  Name,
  Root,
  Row,
  Rows,
  Scroll,
  Side,
  Tag,
  Text,
  Thumb,
  Time,
  Title,
} from './ActivityThread.styles'

export type ActivityEntry = {
  /** ISO time of the activity. */
  at: string
  plant: string
  plantId?: string
  photo?: string
  label: string
  kind?: FeedUpdateKind
  /** Social rows: a 🌿 or a comment someone left on this post. */
  social?: 'reaction' | 'comment'
  /** Feed row this line came from. Clicking opens that moment. */
  updateId?: string
  /** Short state next to the text, such as "Not added yet". */
  tag?: string
}

function dayKey(iso: string) {
  const date = new Date(iso)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function ActivityRow({ entry, onOpen }: { entry: ActivityEntry; onOpen?: () => void }) {
  const { locale } = useI18n()
  const scan = entry.kind === 'scan'
  const time = new Date(entry.at).toLocaleTimeString(locale === 'he' ? 'he-IL' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const body = (
    <>
      <Thumb $scan={scan}>
        {entry.photo ? <PlantImage src={entry.photo} alt="" loading="lazy" /> : <span aria-hidden>{scan ? '✦' : '🌱'}</span>}
        {entry.social ? (
          <Badge $kind="photo" aria-hidden>
            {entry.social === 'reaction' ? '🌿' : '💬'}
          </Badge>
        ) : entry.kind ? (
          <Badge $kind={entry.kind} aria-hidden>
            <MomentGlyph kind={entry.kind} />
          </Badge>
        ) : null}
      </Thumb>
      <Text>
        <Name>{entry.plant}</Name>
        <Label>
          {entry.label}
          {entry.tag ? <Tag $pending={scan && !entry.plantId}>{entry.tag}</Tag> : null}
        </Label>
      </Text>
      <Side>
        <Time dateTime={entry.at}>{time}</Time>
        <XpChip kind={entry.kind} />
      </Side>
    </>
  )

  if (onOpen) {
    return (
      <Row as="button" type="button" onClick={onOpen} $open data-moment={entry.kind} aria-haspopup="dialog">
        {body}
      </Row>
    )
  }
  return <Row data-moment={entry.kind}>{body}</Row>
}

/**
 * The owner's greenhouse log, newest first and grouped by day. Opens on activities that earned XP; All adds
 * scans and the rest. `rail` is the desktop side panel (a card with its title); `sheet` sits inside the phone
 * bell's dialog, which already shows the title.
 */
export function ActivityThread({
  activity: all,
  height,
  variant = 'rail',
  initialShow = 'xp',
}: {
  activity: ActivityEntry[]
  height?: number
  variant?: 'rail' | 'sheet'
  /** The bell opens on Social when there is something new there. */
  initialShow?: 'all' | 'social' | 'xp'
}) {
  const { t, locale } = useI18n()
  const { db, signedIn } = useStore()
  const [show, setShow] = useState<'all' | 'social' | 'xp'>(initialShow)
  // Social: every 🌿 and comment on your posts. All mixes it in with your own log, newest first.
  // Loaded while the thread is open, so the Social label can say how many are new.
  const social = useGreenhouseSocial(signedIn)
  const { markSeen } = social
  const socialCount = social.entries.length
  // Looking at Social (or All, which holds the same rows) counts as seeing them.
  useEffect(() => {
    if (show !== 'xp' && socialCount > 0) markSeen()
  }, [show, socialCount, markSeen])
  const activity =
    show === 'xp'
      ? all.filter((entry) => entry.kind && isPublicActivity(entry.kind))
      : show === 'social'
        ? social.entries
        : [...all, ...social.entries].sort((a, b) => b.at.localeCompare(a.at))
  const [openId, setOpenId] = useState<string | null>(null)
  const openUpdate = openId ? db.updates.find((item) => item.id === openId) : undefined
  const scrollRef = useRef<HTMLDivElement>(null)
  const list = useInfiniteList(activity, {
    signature: `${show}|${activity.map((entry) => `${entry.social ?? 'own'}|${entry.updateId ?? entry.plant}|${entry.at}`).join('|')}`,
  })

  const today = dayKey(new Date().toISOString())
  const yesterday = dayKey(new Date(Date.now() - 86_400_000).toISOString())
  const dayName = (iso: string) => {
    const key = dayKey(iso)
    if (key === today) return t.greenhouse.activityToday
    if (key === yesterday) return t.greenhouse.activityYesterday
    return new Date(iso).toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  const days: { key: string; label: string; entries: ActivityEntry[] }[] = []
  for (const entry of list.shown) {
    const key = dayKey(entry.at)
    const last = days[days.length - 1]
    if (last && last.key === key) last.entries.push(entry)
    else days.push({ key, label: dayName(entry.at), entries: [entry] })
  }

  return (
    <Root $height={height} $variant={variant} aria-label={t.greenhouse.activityTitle} data-activity-thread>
      <Head $variant={variant}>
        {variant === 'rail' ? <Title>{t.greenhouse.activityTitle}</Title> : null}
        {/* A guest has no log of their own: just the header. */}
        {signedIn ? (
          <Segmented
            ariaLabel={t.greenhouse.activityShow}
            value={show}
            onChange={setShow}
            options={[
              { id: 'all', label: t.greenhouse.activityAll },
              {
                id: 'social',
                label:
                  social.unread > 0 && show === 'xp'
                    ? `${t.greenhouse.activitySocial} (${social.unread})`
                    : t.greenhouse.activitySocial,
              },
              { id: 'xp', label: t.greenhouse.activityXp },
            ]}
          />
        ) : null}
      </Head>
      <Scroll ref={scrollRef} $variant={variant}>
        {list.total === 0 ? (
          <Empty>{show === 'social' ? (social.loading ? '…' : t.greenhouse.socialEmpty) : t.greenhouse.noActivity}</Empty>
        ) : (
          <>
            {days.map((day) => (
              <Day key={day.key}>
                <DayLabel>{day.label}</DayLabel>
                <Rows>
                  {day.entries.map((entry, index) => (
                    <li key={`${entry.social ?? 'own'}-${entry.updateId ?? entry.plantId ?? entry.plant}-${entry.at}-${index}`}>
                      <ActivityRow
                        entry={entry}
                        onOpen={entry.updateId ? () => setOpenId(entry.updateId ?? null) : undefined}
                      />
                    </li>
                  ))}
                </Rows>
              </Day>
            ))}
            <InfiniteSentinel hasMore={list.hasMore} onLoadMore={list.loadMore} root={scrollRef} tick={list.shown.length} />
          </>
        )}
      </Scroll>
      {openUpdate ? <ActivityMoment update={openUpdate} onClose={() => setOpenId(null)} /> : null}
    </Root>
  )
}
