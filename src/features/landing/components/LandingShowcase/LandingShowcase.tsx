import { Icon } from '../../../../components/Icon/Icon'
import { useI18n } from '../../../../i18n/I18nProvider'
import { LevelBadge } from '../../../greenhouse/components/LevelBadge/LevelBadge'
import { landingPhotos } from '../../landingShots'
import {
  Body,
  Card,
  Check,
  Eyebrow,
  Fact,
  Facts,
  History,
  LevelChip,
  LevelText,
  Name,
  Photo,
  Scene,
  Shelf,
  ShelfThumbs,
  Species,
  Stage,
  Stamp,
  Task,
  TaskIcon,
  TaskList,
  TaskName,
  TasksHead,
  TaskWhen,
  XpBar,
  XpGain,
} from './LandingShowcase.styles'

/**
 * The hero picture: one plant passport with its care tasks, the greenhouse level and a peek at the shelf.
 * Real plant photos from `public/class-photos/`; a picture of the app, not a live page (nothing here is interactive).
 */
export function LandingShowcase() {
  const { t } = useI18n()

  return (
    <Stage role="img" aria-label={t.landing.showcaseLabel}>
      <Scene aria-hidden="true">
        <Card>
          <Photo>
            <img src={landingPhotos.passport} alt="" loading="eager" decoding="async" draggable={false} />
            <Stamp>{t.landing.showcaseVerified}</Stamp>
          </Photo>
          <Body>
            <Eyebrow>{t.landing.showcasePassport}</Eyebrow>
            <Name>{t.landing.showcaseName}</Name>
            <Species>
              <bdi>{t.landing.showcaseSpecies}</bdi>
            </Species>
            <Facts>
              <Fact>
                <span>{t.landing.showcaseSpotLabel}</span>
                <strong>{t.landing.showcaseSpot}</strong>
              </Fact>
              <Fact>
                <span>{t.landing.showcaseSinceLabel}</span>
                <strong>{t.landing.showcaseSince}</strong>
              </Fact>
            </Facts>
            <TasksHead>{t.landing.showcaseTasks}</TasksHead>
            <TaskList>
              <Task $done>
                <TaskIcon $tone="water">
                  <Icon name="drop" size={16} />
                </TaskIcon>
                <TaskName>{t.landing.showcaseWater}</TaskName>
                <TaskWhen>{t.landing.showcaseWaterWhen}</TaskWhen>
                <Check>{t.landing.showcaseDone}</Check>
              </Task>
              <Task>
                <TaskIcon $tone="photo">
                  <Icon name="calendar" size={16} />
                </TaskIcon>
                <TaskName>{t.landing.showcasePhoto}</TaskName>
                <TaskWhen>{t.landing.showcasePhotoWhen}</TaskWhen>
              </Task>
            </TaskList>
            <History>{t.landing.showcaseHistory}</History>
          </Body>
        </Card>

        <LevelChip>
          <LevelBadge level={4} progress={0.62} size="sm" />
          <LevelText>
            <strong>{t.landing.showcaseLevel.replace('{n}', '4')}</strong>
            <XpBar style={{ ['--xp' as string]: 0.62 }} />
            <span dir="ltr">{t.landing.showcaseXp}</span>
          </LevelText>
          <XpGain dir="ltr">{t.landing.showcaseXpGain}</XpGain>
        </LevelChip>

        <Shelf>
          <ShelfThumbs>
            {landingPhotos.shelf.map((src) => (
              <img key={src} src={src} alt="" loading="eager" decoding="async" draggable={false} />
            ))}
          </ShelfThumbs>
          <span>{t.landing.showcaseShelf}</span>
        </Shelf>
      </Scene>
    </Stage>
  )
}
