import { useParams } from 'react-router-dom'
import { FeatureGate } from '../../components/FeatureGate/FeatureGate'
import { PageGate } from '../../components/PageGate/PageGate'
import { wikiHref } from '../../features/species/components/GuideLink/GuideLink'
import { WikiArticle } from '../../features/species/components/WikiArticle/WikiArticle'
import { WikiIndex } from '../../features/species/components/WikiIndex/WikiIndex'
import { useI18n } from '../../i18n/I18nProvider'
import { configuredSpeciesIds } from '../../mock/classDictionary'
import { useStore } from '../../mock/store'
import { useServerSlices } from '../../mock/useServerSlices'
import type { ComponentView } from '../../theme/view'
import { Back, Header, Missing, Page } from './WikiPage.styles'

function WikiReady({ view }: { view: ComponentView }) {
  const { speciesId } = useParams()
  const { db } = useStore()
  const { t } = useI18n()
  const species = speciesId ? db.species.find((item) => item.id === speciesId) : undefined

  if (view === 'widget') {
    return (
      <Page>
        <Header>
          <h1>{t.guide.title}</h1>
        </Header>
        <WikiIndex speciesIds={configuredSpeciesIds} view="widget" />
      </Page>
    )
  }

  if (speciesId && !species) {
    return (
      <Page>
        <Back to={wikiHref()}>← {t.guide.title}</Back>
        <Header>
          <h1>{t.guide.title}</h1>
        </Header>
        <Missing>{t.charts.categoryNotFound}</Missing>
      </Page>
    )
  }

  if (species) {
    return (
      <Page>
        <Back to={wikiHref()}>← {t.guide.title}</Back>
        <WikiArticle species={species} showMarket={false} />
      </Page>
    )
  }

  return (
    <Page>
      <Header>
        <p>{t.guide.eyebrow}</p>
        <h1>{t.guide.title}</h1>
        <p>{t.guide.subtitle}</p>
      </Header>
      <WikiIndex speciesIds={configuredSpeciesIds} />
    </Page>
  )
}

export function WikiPage({ view = 'page' }: { view?: ComponentView }) {
  useServerSlices(['plants', 'catalog'])
  const { t } = useI18n()

  return (
    <PageGate pageId="wiki" title={t.nav.wiki}>
      <FeatureGate placement="wiki.board" title={t.nav.wiki}>
        <WikiReady view={view} />
      </FeatureGate>
    </PageGate>
  )
}
