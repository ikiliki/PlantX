import type { ReactNode } from 'react'
import { useMediaQuery } from '../../../../lib/useMediaQuery'
import { ListPane, MapPane, Root } from './MarketSplit.styles'

/** Same edge as the container query below: under it the page shows one pane at a time. */
const NARROW = '(max-width: 999px)'

/**
 * Market list and map. Desktop (page container 960px+) shows both side by side, map sticky.
 * Narrower shows one, picked by `MarketViewToggle`, and the incoming pane slides in.
 * The map only mounts when it is on screen, so Leaflet measures a visible box.
 */
export function MarketSplit({
  view,
  list,
  map,
}: {
  view: 'list' | 'map'
  list: ReactNode
  /** Rendered only when visible. */
  map: () => ReactNode
}) {
  const narrow = useMediaQuery(NARROW)
  const showMap = !narrow || view === 'map'

  return (
    <Root data-view={view}>
      <ListPane key={narrow ? `list-${view}` : 'list'} $active={view === 'list'}>
        {list}
      </ListPane>
      <MapPane key={narrow ? `map-${view}` : 'map'} $active={view === 'map'}>
        {showMap ? map() : null}
      </MapPane>
    </Root>
  )
}
