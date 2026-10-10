import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HoldStage } from '../HoldStage/HoldStage'
import { Line, Room, Rooms, SignIn } from '../NotLaunched/NotLaunched.styles'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { useDevice } from '../../lib/useDevice'
import { isPageNavigable, PAGE_IDS, type PageId } from '../../theme/release'

const ROOMS = ['news', 'greenhouse', 'market'] as const
type RoomId = (typeof ROOMS)[number]

/** Where each gated page lives, for the quick links on a page under maintenance. */
const PAGE_PATH: Record<PageId, string> = {
  home: '/home',
  feed: '/social',
  greenhouse: '/greenhouse',
  todo: '/tasks',
  wiki: '/wiki',
  market: '/market',
  rank: '/rank',
}

/**
 * Shared public hold.
 * - not-launched: the rooms explain what opens at launch.
 * - maintenance of one page (`pageId`): names that page and links only to pages that are live.
 * - maintenance with no page (the API is down): the message alone.
 */
export function HoldNotice({
  mode,
  pageId,
  cover = false,
  preview = false,
}: {
  mode: 'not-launched' | 'maintenance'
  pageId?: PageId
  cover?: boolean
  preview?: boolean
}) {
  const { t } = useI18n()
  const { db } = useStore()
  const device = useDevice()
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
  const pageNames: Record<PageId, string> = {
    home: t.nav.home,
    feed: t.nav.feed,
    greenhouse: t.nav.greenhouse,
    todo: t.nav.todo,
    wiki: t.nav.wiki,
    market: t.nav.market,
    rank: t.nav.rank,
  }
  const openPages = pageId ? PAGE_IDS.filter((id) => id !== pageId && isPageNavigable(db.system, id, device)) : []

  const title = launched
    ? t.release.notLaunchedTitle
    : pageId
      ? t.release.pageMaintenanceTitle.replace('{page}', pageNames[pageId])
      : t.release.maintenanceTitle
  const body = launched
    ? t.release.notLaunchedBody
    : pageId
      ? openPages.length > 0
        ? t.release.pageMaintenanceBody
        : t.release.maintenanceBody
      : t.release.maintenanceBody

  return (
    <HoldStage
      mode={mode}
      cover={cover}
      preview={preview}
      mark={launched ? t.release.notLaunched : t.release.maintenance}
      title={title}
      body={body}
    >
      {launched ? (
        <>
          <Rooms>
            {ROOMS.map((id) => (
              <Room key={id} type="button" $on={room === id} aria-pressed={room === id} onClick={() => setRoom(id)}>
                {labels[id]}
              </Room>
            ))}
          </Rooms>
          <Line key={room}>{lines[room]}</Line>
        </>
      ) : openPages.length > 0 ? (
        <Rooms as="nav" aria-label={t.release.openPages}>
          {openPages.map((id) =>
            preview ? (
              <Room key={id} as="span" $on={false}>
                {pageNames[id]}
              </Room>
            ) : (
              <Room key={id} as={Link} to={PAGE_PATH[id]} $on={false}>
                {pageNames[id]}
              </Room>
            ),
          )}
        </Rooms>
      ) : null}
      {preview ? (
        <SignIn as="span">{t.auth.login}</SignIn>
      ) : (
        <SignIn as={Link} to="/login">
          {t.auth.login}
        </SignIn>
      )}
    </HoldStage>
  )
}
