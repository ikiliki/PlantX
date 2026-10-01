import type { TodoSubcategory } from '../../../../mock/types'
import { Glyph, Mark } from './TodoKindIcon.styles'

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
  const glyph =
    kind === 'photo' ? (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
        <path
          fill="currentColor"
          d="M9.4 5.2h5.2l1.1 1.6H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h3.3l1.1-1.6ZM12 17.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Zm0-1.8a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8Z"
        />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
        <path
          fill="currentColor"
          d="M12 2.8c.4 0 .7.2.9.5 1.8 2.6 5.6 7.2 5.6 10.4a6.5 6.5 0 1 1-13 0c0-3.2 3.8-7.8 5.6-10.4.2-.3.5-.5.9-.5Zm0 15.7a3.7 3.7 0 0 0 3.7-3.7c0-1.8-2.2-5.1-3.7-7.3-1.5 2.2-3.7 5.5-3.7 7.3a3.7 3.7 0 0 0 3.7 3.7Z"
        />
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
