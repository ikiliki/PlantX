import { Frame, Page, Shot, StillGrid, Title } from './LandingStills.styles'

export type LandingStillId = 'greenhouse' | 'plant' | 'track' | 'list' | 'buy'

const shots: Record<LandingStillId, { src: string; position: string }> = {
  greenhouse: { src: '/landing/greenhouse-desk.png', position: 'center 34%' },
  plant: { src: '/landing/greenhouse-desk.png', position: '20% 52%' },
  track: { src: '/landing/tasks-phone.png', position: 'center 48%' },
  list: { src: '/landing/home-phone.png', position: 'center 18%' },
  buy: { src: '/landing/greenhouse-phone.png', position: 'center 18%' },
}

/** Static app stills. Not admin config and not the live database. */
export function LandingStill({ id }: { id: LandingStillId; locale?: 'en' | 'he' }) {
  const shot = shots[id]

  return (
    <Shot inert aria-hidden="true">
      <img src={shot.src} alt="" style={{ objectPosition: shot.position }} />
    </Shot>
  )
}

/** Standalone static page. The landing only embeds these frames. */
export function LandingStillsPage() {
  return (
    <Page>
      <Title>Landing stills</Title>
      <StillGrid>
        {(Object.keys(shots) as LandingStillId[]).map((id) => (
          <Frame key={id}>
            <LandingStill id={id} />
          </Frame>
        ))}
      </StillGrid>
    </Page>
  )
}
