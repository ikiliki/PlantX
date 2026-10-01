import { useMemo, useState } from 'react'
import { PageHeader } from '../../app/AppShell/AppShell.styles'
import { Card } from '../../components/Card/Card'
import { AdminTabs } from '../../features/admin/components/AdminTabs/AdminTabs'
import { CatalogEditor } from '../../features/admin/components/CatalogEditor/CatalogEditor'
import {
  Section,
  SectionHead,
  Shell,
} from '../../features/admin/components/CatalogEditor/CatalogEditor.styles'
import { MarketNameTable } from '../../features/admin/components/MarketNameTable/MarketNameTable'
import { filterMarketNames, marketNameColumns, marketNameRows } from '../../features/catalog/marketNameMatrix'
import { MarketSearch } from '../../features/market/components/MarketSearch/MarketSearch'
import { listingFilterMeta } from '../../features/market/listingFilterMeta'
import { emptyMarketFilters } from '../../features/market/marketFilters'
import { useI18n } from '../../i18n/I18nProvider'
import { userPlace } from '../../mock/locations'
import { useStore } from '../../mock/store'
import { Page } from '../SystemPage/SystemPage.styles'

export function ConfigurationsPage() {
  const { currentUser, db } = useStore()
  const { t, locale } = useI18n()
  const [filters, setFilters] = useState(() => emptyMarketFilters())
  const origin = userPlace(currentUser)
  const meta = useMemo(
    () =>
      listingFilterMeta({
        listings: db.listings,
        plants: db.plants,
        species: db.species,
        marketClasses: db.marketClasses,
        catalog: db.catalog,
        filters,
        origin,
        locale,
      }),
    [db.catalog, db.listings, db.marketClasses, db.plants, db.species, filters, locale, origin],
  )
  const names = useMemo(() => {
    const all = marketNameRows(db.catalog, locale)
    return filterMarketNames(all, filters)
  }, [db.catalog, filters, locale])
  const nameColumns = useMemo(
    () => marketNameColumns(db.catalog, locale, names),
    [db.catalog, locale, names],
  )

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Page>
        <PageHeader>
          <h1>{t.admin.configurations}</h1>
        </PageHeader>
        <Card>
          <p>{t.common.guestBlocked}</p>
        </Card>
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader>
        <div>
          <h1>{t.admin.configurations}</h1>
          <p>{t.admin.configurationsLead}</p>
        </div>
      </PageHeader>
      <AdminTabs current="server" />
      <Shell>
        <CatalogEditor />
        <Section>
          <SectionHead>
            <h2>{t.admin.marketNames}</h2>
            <p>
              {t.admin.marketNamesLead} · {names.length}
            </p>
          </SectionHead>
          <MarketSearch filters={filters} onChange={setFilters} meta={meta} />
          <MarketNameTable columns={nameColumns} rows={names} empty={t.admin.noClasses} />
        </Section>
      </Shell>
    </Page>
  )
}
