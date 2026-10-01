import { CommunityRegister } from '../CommunityRegister/CommunityRegister'
import { useI18n } from '../../../../i18n/I18nProvider'
import { Body, Box, Kicker, Title, Wrap } from './LandingAccess.styles'

export function LandingAccess() {
  const { t } = useI18n()

  return (
    <Wrap id="access">
      <Box>
        <div>
          <Kicker>{t.landing.accessKicker}</Kicker>
          <Title>{t.landing.accessTitle}</Title>
          <Body>{t.landing.accessBody}</Body>
        </div>
        <CommunityRegister embedded />
      </Box>
    </Wrap>
  )
}
