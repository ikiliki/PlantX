import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { classPhotos } from '../../../../mock/images'
import { Band, Body, Eyebrow, Head, Index, Inner, Name, Photo, Step, Steps, Title } from './LandingHow.styles'

export function LandingHow() {
  const { t } = useI18n()
  const steps = [
    { title: t.landing.how1Title, body: t.landing.how1Body, photo: classPhotos.potGoldS },
    { title: t.landing.how2Title, body: t.landing.how2Body, photo: classPhotos.monStdL },
    { title: t.landing.how3Title, body: t.landing.how3Body, photo: classPhotos.potNjoy },
    { title: t.landing.how4Title, body: t.landing.how4Body, photo: classPhotos.monStdXl },
  ]

  return (
    <Band id="how">
      <Inner>
        <Head>
          <Eyebrow>{t.landing.howEyebrow}</Eyebrow>
          <Title>{t.landing.howTitle}</Title>
        </Head>
        <Steps>
          {steps.map((step) => (
            <Step key={step.title}>
              <Photo>
                <PlantImage src={step.photo} alt="" />
              </Photo>
              <Index />
              <Name>{step.title}</Name>
              <Body>{step.body}</Body>
            </Step>
          ))}
        </Steps>
      </Inner>
    </Band>
  )
}
