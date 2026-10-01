import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { InfiniteSentinel, useInfiniteList } from '../../../../components/InfiniteScroll/InfiniteScroll'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { Empty, Event, Head, Message, Meta, Photo, Root, Scroll, Tag, Title, When } from './ActivityThread.styles'

export type ActivityEntry = {
  at: string
  plant: string
  plantId?: string
  photo?: string
  label: string
  /** `scan`: an AI identify call from Add Plant, shown before the plant exists. */
  kind?: 'history' | 'scan'
  /** Short state next to the text, such as "Not added yet". */
  tag?: string
}

function ActivityMessage({ entry }: { entry: ActivityEntry }) {
  const scan = entry.kind === 'scan'
  const body = (
    <>
      <Photo $scan={scan}>
        {entry.photo ? <PlantImage src={entry.photo} alt="" /> : scan ? <span aria-hidden>✦</span> : null}
      </Photo>
      <Meta>
        <Event>
          <strong>{entry.plant}</strong> — {entry.label}
        </Event>
        <When>
          {entry.at}
          {entry.tag ? <Tag $pending={scan && !entry.plantId}>{entry.tag}</Tag> : null}
        </When>
      </Meta>
    </>
  )

  if (entry.plantId) {
    return (
      <Message as={Link} to={`/plants/${entry.plantId}`} $scan={scan}>
        {body}
      </Message>
    )
  }

  return <Message $scan={scan}>{body}</Message>
}

export function ActivityThread({ activity, height }: { activity: ActivityEntry[]; height?: number }) {
  const { t } = useI18n()
  const scrollRef = useRef<HTMLDivElement>(null)
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

  return (
    <Root $height={height} aria-label={t.greenhouse.activityTitle}>
      <Head>
        <Title>{t.greenhouse.activityTitle}</Title>
      </Head>
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
              <ActivityMessage key={`${entry.at}-${entry.plantId ?? entry.plant}-${index}`} entry={entry} />
            ))}
          </>
        )}
      </Scroll>
    </Root>
  )
}
