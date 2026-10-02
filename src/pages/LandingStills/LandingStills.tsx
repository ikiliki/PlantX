import { landingShots } from '../../features/landing/landingShots'
import { Frame, Page, Shot, StillGrid, Title } from './LandingStills.styles'

/** Standalone static page listing every landing still, to check a re-shoot at a glance. */
export function LandingStillsPage() {
  return (
    <Page>
      <Title>Landing stills</Title>
      <StillGrid>
        {Object.entries(landingShots).map(([id, src]) => (
          <Frame key={id}>
            <Shot inert aria-hidden="true">
              <img src={src} alt="" />
            </Shot>
          </Frame>
        ))}
      </StillGrid>
    </Page>
  )
}
