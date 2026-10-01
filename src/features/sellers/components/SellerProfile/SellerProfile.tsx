import { GreenhousePage } from '../../../../pages/GreenhousePage/GreenhousePage'
import { ProfilePage } from '../../../../pages/ProfilePage/ProfilePage'
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
      <ProfilePage view={view} userId={userId} titleId={titleId} compact={dialog} />
      <GreenhousePage view={view} ownerId={userId} compact={dialog} />
    </Root>
  )
}

