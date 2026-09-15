import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Grid, PageHeader, SectionTitle } from '../../app/AppShell/AppShell.styles'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { DemandCard } from '../../features/demand/components/DemandCard/DemandCard'
import { ListingCard } from '../../features/market/components/ListingCard/ListingCard'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { plantImages } from '../../mock/images'
import { theme } from '../../theme/tokens'

const Hero = styled.section`
  position: relative;
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  min-height: 280px;
  display: grid;
  align-items: end;
  color: white;
  margin-bottom: ${theme.space.lg};
  background:
    linear-gradient(180deg, rgba(11, 31, 20, 0.15), rgba(11, 31, 20, 0.88)),
    url(${plantImages.hero})
      center/cover;
`

const HeroInner = styled.div`
  padding: ${theme.space.xl};
  display: grid;
  gap: 12px;
  max-width: 640px;
  h1 {
    font-size: clamp(28px, 5vw, 42px);
    line-height: 1.15;
  }
`

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export function DiscoverPage() {
  const { db } = useStore()
  const { t } = useI18n()
  const listings = db.listings.filter((l) => l.status === 'active').slice(0, 4)
  const demands = db.demands.filter((d) => d.status === 'open' || d.status === 'sourcing')

  return (
    <div>
      <Hero>
        <HeroInner>
          <Badge $tone="lime">{t.appName}</Badge>
          <h1>{t.discover.hero}</h1>
          <p style={{ opacity: 0.9 }}>{t.discover.sub}</p>
          <p style={{ fontWeight: 700 }}>{t.growVerifyTrade}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/market">
              <Button type="button">{t.discover.viewAll}</Button>
            </Link>
            <Link to="/demand">
              <Button type="button" variant="secondary">
                {t.discover.viewDemand}
              </Button>
            </Link>
          </div>
        </HeroInner>
      </Hero>

      <PageHeader>
        <div>
          <h1 style={{ fontSize: 22 }}>{t.discover.nearby}</h1>
        </div>
        <Link to="/market">
          <Button variant="ghost" size="sm" type="button">
            {t.discover.viewAll}
          </Button>
        </Link>
      </PageHeader>
      <Grid>{listings.map((l) => <ListingCard key={l.id} listing={l} />)}</Grid>

      <SectionTitle>{t.discover.activeDemand}</SectionTitle>
      <Grid $min="280px">{demands.map((d) => <DemandCard key={d.id} demand={d} />)}</Grid>

      <SectionTitle>{t.discover.categories}</SectionTitle>
      <Chips>
        {db.species.map((s) => (
          <Badge key={s.id} $tone="muted">
            <Link to={`/market?species=${s.id}`}>{s.commonNameHe}</Link>
          </Badge>
        ))}
      </Chips>

      <SectionTitle>{t.discover.trust}</SectionTitle>
      <Card>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <Badge $tone="lime">{t.market.verified}</Badge>
          <span>★ ratings · fulfillment · pest-free declaration · local pickup first</span>
        </div>
      </Card>
    </div>
  )
}
