import { CommunityRegister } from '../CommunityRegister/CommunityRegister'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { classPhotos } from '../../../../mock/images'
import { Brand, Copy, Hero, Mosaic, MosaicCell, Row, Sub, Title } from './LandingHero.styles'

export function LandingHero() {
  const { t } = useI18n()

  return (
    <Hero>
      <Row>
        <Copy>
          <Brand>PlantX</Brand>
          <Title>{t.landing.title}</Title>
          <Sub>{t.landing.sub}</Sub>
          <CommunityRegister />
        </Copy>
        <Mosaic aria-hidden="true">
          <MosaicCell $tall>
            <PlantImage src={classPhotos.monStdL} alt="" />
          </MosaicCell>
          <MosaicCell>
            <PlantImage src={classPhotos.potGoldS} alt="" />
          </MosaicCell>
          <MosaicCell>
            <PlantImage src={classPhotos.potNjoy} alt="" />
          </MosaicCell>
        </Mosaic>
      </Row>
    </Hero>
  )
}
