import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { PageGate } from '../../components/PageGate/PageGate'
import { GuestView } from '../../components/GuestView/GuestView'
import { GradeStack, useGradeQueue } from '../../features/greenhouse/components/GradeStack/GradeStack'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { useServerSlices } from '../../mock/useServerSlices'
import { forAudience } from '../../theme/audience'
import { isPlacementReady } from '../../theme/release'
import type { ComponentView } from '../../theme/view'
import { Eyebrow, Heading, Page, Stage } from './RankPage.styles'

function RankReady({ view }: { view: ComponentView }) {
  const { t } = useI18n()
  const { signedIn, db } = useStore()
  const grading = useGradeQueue()
  const featureReady = isPlacementReady(db.system, 'rank.board')

  const deck = (
    <Page>
      {view === 'page' && (
        <Heading>
          <Eyebrow>{t.grade.eyebrow}</Eyebrow>
          <h1>{t.grade.title}</h1>
        </Heading>
      )}
      <Stage aria-label={t.grade.title}>
        <GradeStack grading={grading} variant={view === 'widget' ? 'widget' : 'page'} />
      </Stage>
    </Page>
  )

  // When the feature is not ready, always show the mocked deck under the gate blur.
  if (!featureReady) return deck

  return forAudience(signedIn, {
    guest: (
      <Page>
        <GuestView title={t.grade.guestTitle} body={t.grade.guestBody} action={t.profile.lockedAction} />
      </Page>
    ),
    signedIn: deck,
  })
}

export function RankPage({ view = 'page' }: { view?: ComponentView }) {
  useServerSlices(['users', 'plants'])
  const { t } = useI18n()

  return (
    <PageGate pageId="rank" title={t.nav.rank}>
      <FeatureGate placement="rank.board" title={t.nav.rank}>
        <RankReady view={view} />
      </FeatureGate>
    </PageGate>
  )
}
