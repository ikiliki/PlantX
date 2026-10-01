import type { ReactNode } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { PLACEMENTS, placementRelease, type PlacementId, type ReleaseMode } from '../../theme/release'
import { Banner, Body, Card, Frame, Live, Mark, Scrim, Title } from './FeatureGate.styles'

function statusLabel(status: ReleaseMode, t: ReturnType<typeof useI18n>['t']) {
  if (status === 'comingSoon') return t.release.notLaunched
  return t.release.maintenance
}

/**
 * Gates a feature entry from Admin → System.
 * When the feature is not ready, keep the mocked UI visible under a blur and a compact banner.
 * Pages are containers of features — never replace a page with an empty notice.
 */
export function FeatureGate({
  placement,
  children,
  title,
  body,
  pending,
}: {
  placement: PlacementId
  children: ReactNode
  title?: string
  body?: string
  /** Quiet shell used instead of blurring the live feature. */
  pending?: ReactNode
}) {
  const { t } = useI18n()
  const { db } = useStore()
  const config = placementRelease(db.system, placement)
  const featureId = PLACEMENTS.find((item) => item.id === placement)?.featureId

  if (!config.enabled) return null
  if (config.status === 'ready') return <>{children}</>
  if (pending) {
    return (
      <Frame data-placement={placement} data-feature={featureId} data-feature-mode={config.status}>
        {pending}
      </Frame>
    )
  }

  return (
    <Frame data-placement={placement} data-feature={featureId} data-feature-mode={config.status}>
      <Live inert aria-hidden="true">
        {children}
      </Live>
      <Scrim aria-hidden="true" />
      <Banner role="status">
        <Card>
          <Mark>{statusLabel(config.status, t)}</Mark>
          {title && <Title>{title}</Title>}
          {body && <Body>{body}</Body>}
        </Card>
      </Banner>
    </Frame>
  )
}
