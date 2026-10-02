import { ProfileSummary } from '../../../profile/components/ProfileSummary/ProfileSummary'
import { GreenhousePage } from '../../../../pages/GreenhousePage/GreenhousePage'
import { Root } from './SellerProfile.styles'

export function SellerProfile({
  userId,
  titleId,
  dialog = false,
}: {
  userId: string
  titleId?: string
  /** Compact layout for market seller overlay — no nested column scroll. */
  dialog?: boolean
}) {
  const view = dialog ? 'widget' : 'page'
  return (
    <Root $dialog={dialog}>
      <ProfileSummary userId={userId} titleId={titleId} compact={dialog || view === 'widget'} />
      <GreenhousePage view={view} ownerId={userId} compact={dialog} />
    </Root>
  )
}

