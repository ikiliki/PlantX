import { Icon } from '../../../../components/Icon/Icon'
import { useI18n } from '../../../../i18n/I18nProvider'
import { landingPhotos } from '../../landingShots'
import {
  Band,
  Body,
  Card,
  CardHead,
  CardIcon,
  CardTitle,
  Cards,
  Head,
  Kicker,
  Lead,
  Pill,
  Strip,
  Title,
} from './LandingSoon.styles'

/**
 * Features that are not open yet (market, rank). Plain cards: no links, no buttons,
 * so nothing here reads as a working market.
 */
export function LandingSoon() {
  const { t } = useI18n()

  return (
    <Band id="soon" aria-labelledby="landing-soon-title">
      <Head>
        <Kicker>{t.landing.soonKicker}</Kicker>
        <Title id="landing-soon-title">{t.landing.soonTitle}</Title>
        <Lead>{t.landing.soonLead}</Lead>
      </Head>
      <Cards>
        <Card>
          <CardHead>
            <CardIcon>
              <Icon name="friends" size={20} />
            </CardIcon>
            <CardTitle>{t.landing.soonMarketTitle}</CardTitle>
            <Pill>{t.landing.soonBadge}</Pill>
          </CardHead>
          <Body>{t.landing.soonMarketBody}</Body>
          <Strip aria-hidden="true">
            {landingPhotos.market.map((src) => (
              <img key={src} src={src} alt="" loading="lazy" decoding="async" draggable={false} />
            ))}
          </Strip>
        </Card>
        <Card>
          <CardHead>
            <CardIcon>
              <Icon name="rank" size={20} />
            </CardIcon>
            <CardTitle>{t.landing.soonRankTitle}</CardTitle>
            <Pill>{t.landing.soonBadge}</Pill>
          </CardHead>
          <Body>{t.landing.soonRankBody}</Body>
        </Card>
      </Cards>
    </Band>
  )
}
