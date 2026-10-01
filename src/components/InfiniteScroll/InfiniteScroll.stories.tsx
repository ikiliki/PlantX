import { useRef } from 'react'
import { InfiniteSentinel, useInfiniteList } from './InfiniteScroll'
import { Frame, Row } from './InfiniteScroll.styles'

const rows = Array.from({ length: 25 }, (_, index) => `Row ${index + 1}`)

export default {
  title: 'Components/InfiniteScroll',
  component: InfiniteSentinel,
}

export const Page = () => {
  const root = useRef<HTMLDivElement>(null)
  const list = useInfiniteList(rows, { pageSize: 8 })

  return (
    <Frame ref={root}>
      {list.shown.map((row) => (
        <Row key={row}>{row}</Row>
      ))}
      <InfiniteSentinel hasMore={list.hasMore} onLoadMore={list.loadMore} root={root} tick={list.shown.length} />
    </Frame>
  )
}
