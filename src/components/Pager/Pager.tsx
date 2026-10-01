import { useEffect, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { Bar, Range, Step } from './Pager.styles'

/** Shared list size. Admin tables, home, market, and greenhouse activity all use it. */
export const PAGE_SIZE = 10

export function pageWindow<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const safe = Math.min(Math.max(0, page), pageCount - 1)
  const start = safe * pageSize
  const shown = items.slice(start, start + pageSize)
  return {
    page: safe,
    pageCount,
    shown,
    from: items.length === 0 ? 0 : start + 1,
    to: start + shown.length,
    total: items.length,
  }
}

/** `anchor: 'end'` opens on the last page, so a timeline lands on the latest rows. */
export function usePaged<T>(
  items: T[],
  options?: { pageSize?: number; anchor?: 'start' | 'end'; enabled?: boolean; signature?: string },
) {
  const pageSize = options?.pageSize ?? PAGE_SIZE
  const enabled = options?.enabled !== false
  const anchor = options?.anchor ?? 'start'
  const signature = options?.signature ?? String(items.length)
  const [page, setPage] = useState(() =>
    enabled && anchor === 'end' ? Math.max(0, Math.ceil(items.length / pageSize) - 1) : 0,
  )

  useEffect(() => {
    const count = Math.max(1, Math.ceil(items.length / pageSize))
    setPage(enabled && anchor === 'end' ? count - 1 : 0)
  }, [signature, anchor, enabled, items.length, pageSize])

  if (!enabled) {
    return {
      page: 0,
      setPage,
      pageCount: 1,
      shown: items,
      from: items.length === 0 ? 0 : 1,
      to: items.length,
      total: items.length,
    }
  }

  const window = pageWindow(items, page, pageSize)
  return { ...window, setPage }
}

export function Pager({
  page,
  pageCount,
  from,
  to,
  total,
  onPage,
}: {
  page: number
  pageCount: number
  from: number
  to: number
  total: number
  onPage: (page: number) => void
}) {
  const { t } = useI18n()
  if (pageCount <= 1) return null

  return (
    <Bar>
      <Step type="button" disabled={page <= 0} onClick={() => onPage(page - 1)}>
        {t.demo.previous}
      </Step>
      <Range>
        {from}–{to} {t.common.of} {total}
      </Range>
      <Step type="button" disabled={page >= pageCount - 1} onClick={() => onPage(page + 1)}>
        {t.demo.next}
      </Step>
    </Bar>
  )
}
