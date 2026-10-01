import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { classPhotos } from '../../../../mock/images'
import {
  Actions,
  Hero,
  Kicker,
  MarketCard,
  PhotoMain,
  PhotoSmall,
  Price,
  Primary,
  Secondary,
  Sub,
  Title,
  Trust,
  Visual,
} from './LandingHero.styles'

export function LandingHero() {
  const { t } = useI18n()

  return (
    <Hero>
      <div>
        <Kicker>{t.landing.kicker}</Kicker>
        <Title>{t.landing.heroTitle}</Title>
        <Sub>{t.landing.heroSub}</Sub>
        <Actions>
          <Primary href="#access">{t.landing.requestAccess}</Primary>
          <Secondary href="#how">{t.landing.seeHow}</Secondary>
        </Actions>
        <Trust>
          <span>
            <strong>{t.landing.trustVerified}</strong> {t.landing.trustVerifiedRest}
          </span>
          <span aria-hidden="true">•</span>
          <span>
            <strong>{t.landing.trustCommunity}</strong> {t.landing.trustCommunityRest}
          </span>
        </Trust>
      </div>
      <Visual>
        <PhotoMain>
          <PlantImage src={classPhotos.monStdXl} alt="" />
        </PhotoMain>
        <PhotoSmall $slot="a">
          <PlantImage src={classPhotos.potGoldL} alt="" />
        </PhotoSmall>
        <PhotoSmall $slot="b">
          <PlantImage src={classPhotos.potNjoy} alt="" />
        </PhotoSmall>
        <MarketCard>
          <PlantImage src={classPhotos.potGoldS} alt="" />
          <div>
            <small>{t.landing.readyToList}</small>
            <strong>{t.landing.heroListing}</strong>
          </div>
          <Price>₪45</Price>
        </MarketCard>
      </Visual>
    </Hero>
  )
}
