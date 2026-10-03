import { Bar } from './Skeleton.styles'

export { blurred } from './Skeleton.styles'

/**
 * A shimmering stand-in for text or an image while there is no data: loading for a member, and
 * the client-only shell a guest sees behind the log-in card. Never fetches anything.
 */
export function SkeletonBar({
  width = '100%',
  height = 12,
  round = false,
}: {
  width?: string
  height?: number
  /** A circle (avatar, ring) instead of a pill. */
  round?: boolean
}) {
  return <Bar aria-hidden $width={width} $height={height} $round={round} />
}
