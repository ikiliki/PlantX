import { Badge } from '../../components/Badge/Badge'
import { GradeChip } from '../../components/GradeChip/GradeChip'
import { PlantImage } from '../../components/PlantImage/PlantImage'
import { classPhotos } from '../../mock/images'
import {
  Frame,
  Meta,
  Page,
  PlantCopy,
  Row,
  Shelf,
  ShelfHead,
  Shot,
  StillGrid,
  Title,
} from './LandingStills.styles'

/** Static landing pictures. Not admin config and not the live database. */
const stills = {
  greenhouse: [
    { name: 'Office golden pothos', nameHe: 'פוטוס זהוב למשרד', meta: 'Watered today', metaHe: 'הושקה היום', photo: classPhotos.potGoldL, pill: 'Growing', pillHe: 'בגידול' },
    { name: "Desk N'Joy", nameHe: "אן ג'וי לשולחן", meta: 'Updated 2 days ago', metaHe: 'עודכן לפני יומיים', photo: classPhotos.potNjoy, pill: 'Growing', pillHe: 'בגידול' },
    { name: 'Window monstera', nameHe: 'מונסטרה לחלון', meta: 'Ready for market', metaHe: 'מוכנה לשוק', photo: classPhotos.monStdL, pill: 'Ready', pillHe: 'מוכנה' },
  ],
} as const

export type LandingStillId = 'greenhouse' | 'plant' | 'track' | 'list' | 'buy'

export function LandingStill({
  id,
  locale = 'en',
}: {
  id: LandingStillId
  locale?: 'en' | 'he'
}) {
  if (id === 'greenhouse') {
    return (
      <Shelf inert aria-hidden="true">
        <ShelfHead>
          <strong>{locale === 'he' ? 'החממה שלי' : 'My greenhouse'}</strong>
          <Badge>{locale === 'he' ? '3 צמחים' : '3 plants'}</Badge>
        </ShelfHead>
        {stills.greenhouse.map((plant) => (
          <Row key={plant.name}>
            <PlantImage src={plant.photo} alt="" />
            <PlantCopy>
              <strong>{locale === 'he' ? plant.nameHe : plant.name}</strong>
              <span>{locale === 'he' ? plant.metaHe : plant.meta}</span>
            </PlantCopy>
            <Badge $tone={plant.pill === 'Ready' ? 'lime' : 'muted'}>
              {locale === 'he' ? plant.pillHe : plant.pill}
            </Badge>
          </Row>
        ))}
      </Shelf>
    )
  }

  const shot =
    id === 'plant'
      ? classPhotos.potGoldS
      : id === 'track'
        ? classPhotos.monStdL
        : id === 'list'
          ? classPhotos.potNjoy
          : classPhotos.monStdXl

  return (
    <Shot inert aria-hidden="true">
      <PlantImage src={shot} alt="" />
      {id === 'list' && (
        <Meta>
          <GradeChip grade="A" />
          <span>₪45</span>
        </Meta>
      )}
      {id === 'buy' && (
        <Meta>
          <GradeChip grade="S" />
        </Meta>
      )}
    </Shot>
  )
}

/** Standalone static page. The landing only embeds these frames. */
export function LandingStillsPage() {
  return (
    <Page>
      <Title>Landing stills</Title>
      <StillGrid>
        <Frame>
          <LandingStill id="greenhouse" />
        </Frame>
        <Frame>
          <LandingStill id="plant" />
        </Frame>
        <Frame>
          <LandingStill id="track" />
        </Frame>
        <Frame>
          <LandingStill id="list" />
        </Frame>
        <Frame>
          <LandingStill id="buy" />
        </Frame>
      </StillGrid>
    </Page>
  )
}
