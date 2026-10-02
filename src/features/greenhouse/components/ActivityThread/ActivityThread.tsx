import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { InfiniteSentinel, useInfiniteList } from '../../../../components/InfiniteScroll/InfiniteScroll'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { ActivityMoment, MomentGlyph, MomentPlay } from '../../../feed/components/ActivityMoment/ActivityMoment'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { FeedUpdateKind } from '../../../../mock/types'
import {
  Empty,
  Event,
  Head,
  Message,
  Meta,
  MoreAbove,
  Photo,
  Root,
  Scroll,
  ScrollFrame,
  Tag,
  Title,
  When,
} from './ActivityThread.styles'

export type ActivityEntry = {
  at: string
  plant: string
  plantId?: string
  photo?: string
  label: string
  kind?: FeedUpdateKind
  /** Feed row this line came from. Clicking opens that moment. */
  updateId?: string
  /** Short state next to the text, such as "Not added yet". */
  tag?: string
}

function ActivityMessage({ entry, onOpen }: { entry: ActivityEntry; onOpen?: () => void }) {
  const scan = entry.kind === 'scan'
  const body = (
    <>
      {entry.kind ? <MomentPlay kind={entry.kind} /> : null}
      <Photo $scan={scan}>
        {entry.photo ? <PlantImage src={entry.photo} alt="" /> : scan ? <span aria-hidden>✦</span> : null}
      </Photo>
      <Meta>
        <Event>
          <strong>{entry.plant}</strong> — {entry.label}
        </Event>
        <When>
          {entry.kind ? <MomentGlyph kind={entry.kind} /> : null}
          {entry.at}
          {entry.tag ? <Tag $pending={scan && !entry.plantId}>{entry.tag}</Tag> : null}
        </When>
      </Meta>
    </>
  )

  if (onOpen) {
    return (
      <Message as="button" type="button" onClick={onOpen} $kind={entry.kind} $open data-moment={entry.kind} aria-haspopup="dialog">
        {body}
      </Message>
    )
  }

  return (
    <Message $kind={entry.kind} data-moment={entry.kind}>
      {body}
    </Message>
  )
}

export function ActivityThread({ activity, height }: { activity: ActivityEntry[]; height?: number }) {
  const { t } = useI18n()
  const { db } = useStore()
  const [openId, setOpenId] = useState<string | null>(null)
  const openUpdate = openId ? db.updates.find((item) => item.id === openId) : undefined
  const scrollRef = useRef<HTMLDivElement>(null)
  const [moreAbove, setMoreAbove] = useState(false)
  const stick = useRef(true)
  const before = useRef({ height: 0, top: 0 })
  const signature = activity.map((entry) => `${entry.at}|${entry.plant}|${entry.label}`).join('|')
  const list = useInfiniteList(activity, { anchor: 'end', signature })
  const seen = useRef(signature)
  if (seen.current !== signature) {
    seen.current = signature
    stick.current = true
  }

  const loadOlder = () => {
    const node = scrollRef.current
    if (node) before.current = { height: node.scrollHeight, top: node.scrollTop }
    stick.current = false
    list.loadMore()
  }

  useLayoutEffect(() => {
    const node = scrollRef.current
    if (!node) return
    if (stick.current) {
      node.scrollTop = node.scrollHeight
      return
    }
    node.scrollTop = before.current.top + node.scrollHeight - before.current.height
  }, [list.shown.length, signature])

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    const measure = () => setMoreAbove(node.scrollTop > 24)
    measure()
    node.addEventListener('scroll', measure, { passive: true })
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => {
      node.removeEventListener('scroll', measure)
      observer.disconnect()
    }
  }, [list.shown.length, signature])

  return (
    <Root $height={height} aria-label={t.greenhouse.activityTitle}>
      <Head>
        <Title>{t.greenhouse.activityTitle}</Title>
      </Head>
      <ScrollFrame>
        <Scroll ref={scrollRef}>
          {list.total === 0 ? (
            <Empty>{t.greenhouse.noActivity}</Empty>
          ) : (
            <>
              <InfiniteSentinel
                hasMore={list.hasMore}
                onLoadMore={loadOlder}
                root={scrollRef}
                tick={list.shown.length}
              />
              {list.shown.map((entry, index) => (
                <ActivityMessage
                  key={entry.updateId ?? `${entry.at}-${entry.plantId ?? entry.plant}-${index}`}
                  entry={entry}
                  onOpen={entry.updateId ? () => setOpenId(entry.updateId ?? null) : undefined}
                />
              ))}
            </>
          )}
        </Scroll>
        <MoreAbove $on={moreAbove} aria-hidden />
      </ScrollFrame>
      {openUpdate ? <ActivityMoment update={openUpdate} onClose={() => setOpenId(null)} /> : null}
    </Root>
  )
}
