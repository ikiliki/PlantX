import { DiscoverPage } from '../../../../pages/DiscoverPage/DiscoverPage'
import { FeedPage } from '../../../../pages/FeedPage/FeedPage'
import { GreenhousePage } from '../../../../pages/GreenhousePage/GreenhousePage'
import { MarketPage } from '../../../../pages/MarketPage/MarketPage'
import { RankPage } from '../../../../pages/RankPage/RankPage'
import { TodoPage } from '../../../../pages/TodoPage/TodoPage'
import { WikiPage } from '../../../../pages/WikiPage/WikiPage'
import type { DeviceId, PageId } from '../../../../theme/release'
import { DevicePreview } from './PlacementPreview'
import { Page, Stage } from './PagePreview.styles'

function pageBody(pageId: PageId) {
  if (pageId === 'home') return <DiscoverPage />
  if (pageId === 'feed') return <FeedPage />
  if (pageId === 'market') return <MarketPage />
  if (pageId === 'greenhouse') return <GreenhousePage />
  if (pageId === 'todo') return <TodoPage />
  if (pageId === 'rank') return <RankPage />
  return <WikiPage />
}

/** The real page, inside a window that scrolls on its own. */
export function PagePreview({ pageId, device }: { pageId: PageId; device?: DeviceId }) {
  if (device) return <DevicePreview device={device}>{pageBody(pageId)}</DevicePreview>
  return (
    <Page tabIndex={0}>
      <Stage inert>{pageBody(pageId)}</Stage>
    </Page>
  )
}
