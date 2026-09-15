import { Link } from 'react-router-dom'
import { Card } from '../../../../components/Card/Card'
import { ProgressBar } from '../../../../components/ProgressBar/ProgressBar'
import { Badge } from '../../../../components/Badge/Badge'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { DemandRequest } from '../../../../mock/types'
import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
`

const Meta = styled.div`
  display: grid;
  gap: 4px;
  font-size: 13px;
  color: ${theme.colors.muted};
  margin-top: 12px;
`

export function DemandCard({ demand }: { demand: DemandRequest }) {
  const { db } = useStore()
  const { t, tr, formatMoney, locale } = useI18n()
  const species = db.species.find((s) => s.id === demand.speciesId)
  const buyer = db.users.find((u) => u.id === demand.buyerId)

  return (
    <Link to={`/demand/${demand.id}`}>
      <Card $clickable>
        <Row>
          <div>
            <strong style={{ fontSize: 17 }}>{tr(demand.title, demand.titleHe)}</strong>
            <div style={{ color: theme.colors.muted, fontSize: 13, marginTop: 4 }}>
              {buyer && (locale === 'he' ? buyer.businessNameHe ?? buyer.nameHe : buyer.businessName ?? buyer.name)}
              {' · '}
              {tr(species?.commonName ?? '', species?.commonNameHe ?? '')}
            </div>
          </div>
          <Badge $tone={demand.status === 'open' ? 'lime' : 'forest'}>{demand.status}</Badge>
        </Row>
        <ProgressBar
          value={demand.committedQty}
          max={demand.targetQty}
          label={t.demand.progress}
        />
        <Meta>
          <span>
            {t.demand.priceRange}: {formatMoney(demand.priceMin)}–{formatMoney(demand.priceMax)}
          </span>
          <span>
            {t.demand.minQty}: {demand.minSupplierQty} · {t.demand.due}: {demand.dueDate}
          </span>
          <span>
            {locale === 'he' ? demand.regionHe : demand.region} · quality {demand.quality.join('/')}
          </span>
        </Meta>
      </Card>
    </Link>
  )
}
