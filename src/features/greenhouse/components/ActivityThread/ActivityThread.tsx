import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { Empty, Event, Message, Meta, Photo, Root, Scroll, Tag, When } from './ActivityThread.styles'

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

export function ActivityThread({ activity }: { activity: ActivityEntry[] }) {
  const { t } = useI18n()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [activity.length])

  return (
    <Root aria-label={t.greenhouse.activityTitle}>
      <Scroll ref={scrollRef}>
        {activity.length === 0 ? (
          <Empty>{t.greenhouse.noActivity}</Empty>
        ) : (
          activity.map((entry, index) => (
            <ActivityMessage key={`${entry.at}-${entry.plantId ?? entry.plant}-${index}`} entry={entry} />
          ))
        )}
      </Scroll>
    </Root>
  )
}
