import styled from 'styled-components'
import { PageHeader } from '../../app/AppShell/AppShell.styles'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { useI18n } from '../../i18n/I18nProvider'
import { theme } from '../../theme/tokens'

const Banner = styled.div`
  background: #FDE8E6;
  color: ${theme.colors.danger};
  border: 1px solid #f5c2bc;
  border-radius: ${theme.radii.lg};
  padding: ${theme.space.md};
  font-weight: 700;
  margin-bottom: ${theme.space.lg};
`

const Grid = styled.div`
  display: grid;
  gap: ${theme.space.md};
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin-bottom: ${theme.space.lg};
`

const StepCard = styled(Card)`
  min-height: 140px;
`

export function FinancingPage() {
  const { t } = useI18n()

  return (
    <div>
      <PageHeader>
        <div>
          <h1>{t.financing.title}</h1>
          <p>{t.financing.concept}</p>
        </div>
        <Badge $tone="danger">POC</Badge>
      </PageHeader>

      <Banner>{t.financing.banner}</Banner>

      <Grid>
        <StepCard>
          <Badge $tone="muted">1</Badge>
          <h3 style={{ marginTop: 8 }}>Project</h3>
          <p style={{ color: theme.colors.muted, fontSize: 14 }}>Wedding garden inventory concept</p>
        </StepCard>
        <StepCard>
          <Badge $tone="muted">2</Badge>
          <h3 style={{ marginTop: 8 }}>Event use</h3>
          <p style={{ color: theme.colors.muted, fontSize: 14 }}>Living décor for one night</p>
        </StepCard>
        <StepCard>
          <Badge $tone="muted">3</Badge>
          <h3 style={{ marginTop: 8 }}>Recover</h3>
          <p style={{ color: theme.colors.muted, fontSize: 14 }}>Sort, grade, store</p>
        </StepCard>
        <StepCard>
          <Badge $tone="muted">4</Badge>
          <h3 style={{ marginTop: 8 }}>Redistribute</h3>
          <p style={{ color: theme.colors.muted, fontSize: 14 }}>Offices, shops, collectors</p>
        </StepCard>
      </Grid>

      <Card>
        <h2 style={{ marginBottom: 8 }}>Return forecast (illustrative only)</h2>
        <p style={{ color: theme.colors.muted, marginBottom: 16 }}>{t.financing.note}</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <Badge $tone="muted">Conservative</Badge>
          <Badge $tone="muted">Base</Badge>
          <Badge $tone="muted">Optimistic</Badge>
        </div>
        <Button disabled block>
          {t.financing.blocked}
        </Button>
      </Card>
    </div>
  )
}
