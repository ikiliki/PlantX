import { useEffect, useRef, useState, type RefObject } from 'react'
import { PAGE_SIZE } from '../Pager/Pager'
import { Sentinel } from './InfiniteScroll.styles'

/** Grow a list by `PAGE_SIZE`. `end` keeps the latest rows and loads older ones upward. */
export function useInfiniteList<T>(
  items: T[],
  options?: { pageSize?: number; anchor?: 'start' | 'end'; enabled?: boolean; signature?: string },
) {
  const pageSize = options?.pageSize ?? PAGE_SIZE
  const enabled = options?.enabled !== false
  const anchor = options?.anchor ?? 'start'
  const signature = options?.signature ?? String(items.length)
  const [visible, setVisible] = useState(pageSize)
  const [seen, setSeen] = useState(signature)

  if (seen !== signature) {
    setSeen(signature)
    setVisible(pageSize)
  }

  const count = seen === signature ? visible : pageSize
  const shown = !enabled
    ? items
    : anchor === 'end'
      ? items.slice(Math.max(0, items.length - count))
      : items.slice(0, Math.min(items.length, count))

  return {
    shown,
    hasMore: enabled && shown.length < items.length,
    loadMore: () => setVisible((current) => current + pageSize),
    total: items.length,
  }
}

/** Loads the next page when this edge enters the scroll parent. */
export function InfiniteSentinel({
  hasMore,
  onLoadMore,
  root,
  tick = 0,
}: {
  hasMore: boolean
  onLoadMore: () => void
  root?: RefObject<HTMLElement | null>
  /** Changes after a page appends, so a sentinel that stays visible can load again. */
  tick?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const loadRef = useRef(onLoadMore)
  loadRef.current = onLoadMore

  useEffect(() => {
    const node = ref.current
    if (!node || !hasMore) return
    let fired = false
    const parent = root?.current
    const scrolls = parent ? getComputedStyle(parent).overflowY !== 'visible' : false
    const observer = new IntersectionObserver(
      (entries) => {
        if (fired || !entries.some((entry) => entry.isIntersecting)) return
        fired = true
        loadRef.current()
      },
      { root: scrolls ? parent : null, rootMargin: '160px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, root, tick])

  if (!hasMore) return null
  return <Sentinel ref={ref} aria-hidden="true" />
}
