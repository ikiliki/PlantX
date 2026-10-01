import { useI18n } from '../../../../i18n/I18nProvider'
import { Body, Feature, Section, Shot, Stack, Title } from './LandingScreens.styles'

export function LandingScreens() {
  const { t } = useI18n()
  const features = [
    { title: t.landing.greenhouseTitle, body: t.landing.greenhouseBody },
    { title: t.landing.marketTitle, body: t.landing.marketBody },
    { title: t.landing.rankTitle, body: t.landing.rankBody },
    { title: t.landing.wikiTitle, body: t.landing.wikiBody },
    { title: t.landing.examplePassportTitle, body: t.landing.examplePassportBody },
  ]

  return (
    <Section id="product">
      <Stack>
        {features.map((item) => (
          <Feature key={item.title}>
            <div>
              <Title>{item.title}</Title>
              <Body>{item.body}</Body>
            </div>
            <Shot aria-hidden="true" />
          </Feature>
        ))}
      </Stack>
    </Section>
  )
}
