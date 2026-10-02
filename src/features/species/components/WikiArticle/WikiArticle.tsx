import { useEffect, useState } from 'react'
import { HealthChip } from '../../../../components/HealthChip/HealthChip'
import { GrowingNotes } from '../../../../components/GrowingNotes/GrowingNotes'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { isPlacementReady } from '../../../../theme/release'
import { HEALTH_MEANING } from '../../../../mock/marketNaming'
import { seasonalCareFor } from '../../../../mock/seasonalCare'
import type { QualityGrade, Species } from '../../../../mock/types'
import { speciesName } from '../../../market/categoryData'
import { speciesHref } from '../GuideLink/GuideLink'
import { ListedPlants } from '../ListedPlants/ListedPlants'
import { WikiInfobox } from '../WikiInfobox/WikiInfobox'
import { WikiMarketWidget } from '../WikiMarketWidget/WikiMarketWidget'
import { WikiSection } from '../WikiSection/WikiSection'
import { WikiToc } from '../WikiToc/WikiToc'
import {
  Article,
  Body,
  Fact,
  Facts,
  Grade,
  Grades,
  Layout,
  Lead,
  Rail,
  Scientific,
  Title,
  TocWrap,
} from './WikiArticle.styles'

const ALL_HEALTH: QualityGrade[] = ['S', 'A', 'B', 'C', 'D']

function fill(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template)
}

export function WikiArticle({ species, showMarket = true }: { species: Species; showMarket?: boolean }) {
  const { t, tr, locale } = useI18n()
  const marketOn = isPlacementReady(useStore().db.system, 'market.board')
  const name = speciesName(species, locale)
  const rarity =
    species.rarity === 'unique' ? t.plant.unique : species.rarity === 'rare' ? t.plant.rare : t.plant.common
  const seasonal = seasonalCareFor(species.id)
  const sections = [
    { id: 'overview', title: t.guide.overview },
    ...(seasonal ? [{ id: 'seasonal', title: t.plant.seasonalCare }] : [{ id: 'conditions', title: t.plant.conditions }]),
    { id: 'grades', title: t.guide.gradesTitle },
    ...(marketOn ? [{ id: 'listed', title: t.guide.listed }] : []),
  ]
  const [open, setOpen] = useState<Record<string, boolean>>({
    overview: true,
    seasonal: true,
    conditions: true,
    grades: true,
    listed: true,
  })

  const toggle = (id: string) => setOpen((current) => ({ ...current, [id]: !current[id] }))
  const jump = (id: string) => {
    setOpen((current) => ({ ...current, [id]: true }))
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (!hash) return
    setOpen((current) => ({ ...current, [hash]: true }))
    window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [species.id])

  return (
    <Article>
      <Title>{name}</Title>
      <Scientific>
        <em>{species.scientificName}</em>
      </Scientific>
      <Layout>
        <Lead>
          <p>
            {fill(t.guide.lead, {
              name,
              scientific: species.scientificName,
              rarity,
              time: tr(species.growthTime.en, species.growthTime.he),
            })}
          </p>
          <p>
            {fill(t.guide.leadCare, {
              light: tr(species.conditions.light, species.conditions.lightHe),
              water: tr(species.conditions.water, species.conditions.waterHe),
            })}
          </p>
        </Lead>
        <Rail>
          <WikiInfobox species={species} />
          {showMarket && marketOn ? <WikiMarketWidget speciesId={species.id} compact /> : null}
        </Rail>
        <TocWrap>
          <WikiToc items={sections} onJump={jump} />
        </TocWrap>
        <Body>
          <WikiSection id="overview" title={t.guide.overview} open={Boolean(open.overview)} onToggle={() => toggle('overview')}>
            <Facts>
              <Fact>
                <dt>{t.plant.growthTime}</dt>
                <dd>{tr(species.growthTime.en, species.growthTime.he)}</dd>
              </Fact>
              <Fact>
                <dt>{t.plant.light}</dt>
                <dd>{tr(species.conditions.light, species.conditions.lightHe)}</dd>
              </Fact>
              <Fact>
                <dt>{t.plant.water}</dt>
                <dd>{tr(species.conditions.water, species.conditions.waterHe)}</dd>
              </Fact>
            </Facts>
          </WikiSection>
          {seasonal ? (
            <WikiSection
              id="seasonal"
              title={t.plant.seasonalCare}
              open={Boolean(open.seasonal)}
              onToggle={() => toggle('seasonal')}
            >
              <GrowingNotes speciesId={species.id} hideHeading />
            </WikiSection>
          ) : (
            <WikiSection
              id="conditions"
              title={t.plant.conditions}
              open={Boolean(open.conditions)}
              onToggle={() => toggle('conditions')}
            >
              <GrowingNotes growthTime={species.growthTime} conditions={species.conditions} />
            </WikiSection>
          )}
          <WikiSection id="grades" title={t.guide.gradesTitle} open={Boolean(open.grades)} onToggle={() => toggle('grades')}>
            <Grades>
              {ALL_HEALTH.map((health) => (
                <Grade key={health}>
                  <HealthChip health={health} />
                  <span>{locale === 'he' ? HEALTH_MEANING[health].he : HEALTH_MEANING[health].en}</span>
                </Grade>
              ))}
            </Grades>
          </WikiSection>
          {marketOn && (
            <WikiSection id="listed" title={t.guide.listed} open={Boolean(open.listed)} onToggle={() => toggle('listed')}>
              <ListedPlants speciesId={species.id} marketHref={speciesHref(species.id, 'market')} bare />
            </WikiSection>
          )}
        </Body>
      </Layout>
    </Article>
  )
}
