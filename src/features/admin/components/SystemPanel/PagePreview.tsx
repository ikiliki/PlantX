import { DiscoverPage } from '../../../../pages/DiscoverPage/DiscoverPage'
import { GreenhousePage } from '../../../../pages/GreenhousePage/GreenhousePage'
import { MarketPage } from '../../../../pages/MarketPage/MarketPage'
import { RankPage } from '../../../../pages/RankPage/RankPage'
import { WikiPage } from '../../../../pages/WikiPage/WikiPage'
import type { PageId } from '../../../../theme/release'
import { Page, Stage } from './PagePreview.styles'

function pageBody(pageId: PageId) {
  if (pageId === 'home') return <DiscoverPage />
  if (pageId === 'market') return <MarketPage />
  if (pageId === 'greenhouse') return <GreenhousePage />
  if (pageId === 'rank') return <RankPage />
  return <WikiPage />
}

/** The real page, inside a window that scrolls on its own. */
export function PagePreview({ pageId }: { pageId: PageId }) {
  return (
    <Page tabIndex={0}>
      <Stage inert>{pageBody(pageId)}</Stage>
    </Page>
  )
}
