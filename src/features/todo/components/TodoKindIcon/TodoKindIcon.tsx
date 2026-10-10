import type { TodoSubcategory } from '../../../../mock/types'
import { Glyph, Mark } from './TodoKindIcon.styles'

/** One 24px path per kind of care. */
const PATHS: Record<TodoSubcategory, string> = {
  water:
    'M12 2.8c.4 0 .7.2.9.5 1.8 2.6 5.6 7.2 5.6 10.4a6.5 6.5 0 1 1-13 0c0-3.2 3.8-7.8 5.6-10.4.2-.3.5-.5.9-.5Zm0 15.7a3.7 3.7 0 0 0 3.7-3.7c0-1.8-2.2-5.1-3.7-7.3-1.5 2.2-3.7 5.5-3.7 7.3a3.7 3.7 0 0 0 3.7 3.7Z',
  photo:
    'M9.4 5.2h5.2l1.1 1.6H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h3.3l1.1-1.6ZM12 17.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Zm0-1.8a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8Z',
  // A sprouting leaf: feeding.
  feed:
    'M19.6 3.4a.9.9 0 0 1 .9.9c0 6.2-3.3 10-8.2 10.6v5.8a.9.9 0 1 1-1.8 0v-3.5C6.6 16.7 3.5 14 3.5 9.6a.9.9 0 0 1 .9-.9c2.8 0 5.1 1 6.5 2.8.9-4.6 4-8.1 8.7-8.1Zm-1 1.9c-3.5.5-5.8 3.5-6.2 7.7 3.4-.6 5.7-3.3 6.2-7.7ZM5.4 10.6c.4 2.4 2.1 3.9 4.6 4.3-.4-2.4-2.1-3.9-4.6-4.3Z',
  // A pot with a rim: repotting.
  repot:
    'M4 5h16a1 1 0 0 1 1 1v2.5a1 1 0 0 1-1 1h-.9l-1.3 9.1a2 2 0 0 1-2 1.7H8.2a2 2 0 0 1-2-1.7L4.9 9.5H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2v.6h14V7H5Zm1.9 2.5 1.2 8.8h7.8l1.2-8.8H6.9Z',
  // A turning arrow: rotate toward the light.
  rotate:
    'M12 4.2a7.8 7.8 0 0 1 6.9 4.2V6.2a.9.9 0 1 1 1.8 0v4.6a.9.9 0 0 1-.9.9h-4.6a.9.9 0 1 1 0-1.8h2.2A6 6 0 1 0 18 13a.9.9 0 1 1 1.8.2A7.8 7.8 0 1 1 12 4.2Z',
}

export function TodoKindIcon({
  kind,
  size = 16,
  mark = false,
}: {
  kind: TodoSubcategory
  size?: number
  /** Filled circular badge for passport / stamps. */
  mark?: boolean
}) {
  const glyph = (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path fill="currentColor" d={PATHS[kind]} />
    </svg>
  )

  if (mark) {
    return (
      <Mark $kind={kind} aria-hidden>
        <Glyph $kind={kind}>{glyph}</Glyph>
      </Mark>
    )
  }

  return (
    <Glyph $kind={kind} aria-hidden>
      {glyph}
    </Glyph>
  )
}
