import type { ServerSlice } from '../mock/liveApi'
import type { PageId, PlacementId } from '../theme/release'

/** A page that can be pulled to refresh on the phone, and the server data it shows. */
export type RefreshablePage = {
  pageId: PageId
  /** The page's main placement: off or not ready means the page is still "coming soon". */
  board: PlacementId
  slices: ServerSlice[]
}

/**
 * Pages with pull to refresh (Home has its own, in the feed). Each lists the same slices the page loads,
 * so a pull refetches exactly what is on screen.
 */
const PAGES: { match: RegExp; page: RefreshablePage }[] = [
  { match: /^\/market(\/|$)/, page: { pageId: 'market', board: 'market.board', slices: ['users', 'plants', 'catalog'] } },
  {
    match: /^\/greenhouse(\/|$)/,
    page: { pageId: 'greenhouse', board: 'greenhouse.board', slices: ['users', 'plants', 'updates', 'todos', 'catalog'] },
  },
  { match: /^\/tasks(\/|$)/, page: { pageId: 'todo', board: 'todo.board', slices: ['users', 'plants', 'todos', 'updates'] } },
  { match: /^\/wiki(\/|$)/, page: { pageId: 'wiki', board: 'wiki.board', slices: ['plants', 'catalog'] } },
]

export function refreshablePage(pathname: string): RefreshablePage | null {
  return PAGES.find((entry) => entry.match.test(pathname))?.page ?? null
}
