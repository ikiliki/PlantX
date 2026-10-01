import { FeatureGate } from '../../../../components/FeatureGate/FeatureGate'
import { GradeStack, useGradeQueue } from '../../../greenhouse/components/GradeStack/GradeStack'
import { useI18n } from '../../../../i18n/I18nProvider'
import { Deck, Expand, Head, Heading, Panel } from './RankRail.styles'

export function RankRail() {
  const { t } = useI18n()
  const grading = useGradeQueue()

  return (
    <FeatureGate placement="home.rank" title={t.nav.rank}>
      <Panel aria-label={t.nav.rank}>
        <Head>
          <Heading>{t.nav.rank}</Heading>
          <Expand to="/rank">{t.market.expand}</Expand>
        </Head>
        <Deck>
          <GradeStack grading={grading} variant="widget" />
        </Deck>
      </Panel>
    </FeatureGate>
  )
}
