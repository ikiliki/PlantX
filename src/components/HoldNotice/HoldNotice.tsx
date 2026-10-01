import { useState } from 'react'
import { HoldStage } from '../HoldStage/HoldStage'
import { Line, Room, Rooms } from '../NotLaunched/NotLaunched.styles'
import { useI18n } from '../../i18n/I18nProvider'

const ROOMS = ['news', 'greenhouse', 'market'] as const
type RoomId = (typeof ROOMS)[number]

/** Shared public hold: not launched, or a page under maintenance. */
export function HoldNotice({
  mode,
  cover = false,
  preview = false,
}: {
  mode: 'not-launched' | 'maintenance'
  cover?: boolean
  preview?: boolean
}) {
  const { t } = useI18n()
  const [room, setRoom] = useState<RoomId>('news')
  const launched = mode === 'not-launched'

  const lines: Record<RoomId, string> = {
    news: t.release.roomNews,
    greenhouse: t.release.roomGreenhouse,
    market: t.release.roomMarket,
  }
  const labels: Record<RoomId, string> = {
    news: t.nav.home,
    greenhouse: t.nav.greenhouse,
    market: t.nav.market,
  }

  return (
    <HoldStage
      mode={mode}
      cover={cover}
      preview={preview}
      mark={launched ? t.release.notLaunched : t.release.maintenance}
      title={launched ? t.release.notLaunchedTitle : t.release.maintenanceTitle}
      body={launched ? t.release.notLaunchedBody : t.release.maintenanceBody}
    >
      <Rooms>
        {ROOMS.map((id) => (
          <Room key={id} type="button" $on={room === id} aria-pressed={room === id} onClick={() => setRoom(id)}>
            {labels[id]}
          </Room>
        ))}
      </Rooms>
      <Line key={room}>{lines[room]}</Line>
    </HoldStage>
  )
}
