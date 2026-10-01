import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { Empty, Event, Message, Meta, Photo, Root, Scroll, When } from './ActivityThread.styles'

export type ActivityEntry = {
  at: string
  plant: string
  plantId?: string
  photo?: string
  label: string
}

function ActivityMessage({ entry }: { entry: ActivityEntry }) {
  const body = (
    <>
      <Photo>{entry.photo ? <PlantImage src={entry.photo} alt="" /> : null}</Photo>
      <Meta>
        <Event>
          <strong>{entry.plant}</strong> — {entry.label}
        </Event>
        <When>{entry.at}</When>
      </Meta>
    </>
  )

  if (entry.plantId) {
    return (
      <Message as={Link} to={`/plants/${entry.plantId}`}>
        {body}
      </Message>
    )
  }

  return <Message>{body}</Message>
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
