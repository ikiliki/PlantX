import { useEffect, useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { useI18n } from '../../../../i18n/I18nProvider'
import { dismissCatalogSuggestion, fetchCatalogSuggestions } from '../../../../mock/liveApi'
import type { CatalogSuggestion } from '../../../../mock/types'
import { Actions, Box, Head, Hits, Name, Row } from './CatalogSuggestions.styles'

export function tickerFromPlant(genus: string, scientificName: string) {
  const word = (genus || scientificName).replace(/[^A-Za-z]/g, '')
  return word.slice(0, 4).toUpperCase()
}

/** Open identify hits that matched no category. Stories pass `items` and skip the server. */
export function CatalogSuggestions({
  items,
  refreshKey = 0,
  onAdd,
  onDismiss,
}: {
  items?: CatalogSuggestion[]
  refreshKey?: number
  onAdd: (item: CatalogSuggestion) => void
  onDismiss?: (id: string) => void
}) {
  const { t } = useI18n()
  const [rows, setRows] = useState<CatalogSuggestion[]>(items ?? [])

  useEffect(() => {
    if (items) {
      setRows(items)
      return
    }
    let cancel = false
    void fetchCatalogSuggestions().then((next) => {
      if (!cancel && next) setRows(next)
    })
    return () => {
      cancel = true
    }
  }, [items, refreshKey])

  if (rows.length === 0) return null

  const dismiss = (id: string) => {
    if (items) {
      onDismiss?.(id)
      return
    }
    setRows((current) => current.filter((row) => row.id !== id))
    void dismissCatalogSuggestion(id)
  }

  return (
    <Box>
      <Head>
        <strong>{t.admin.suggestedCategories}</strong>
        <p>{t.admin.suggestedCategoriesLead}</p>
      </Head>
      {rows.map((row) => (
        <Row key={row.id}>
          <Name>
            <strong>{row.name}</strong>
            {row.scientificName && row.scientificName !== row.name ? <small>{row.scientificName}</small> : null}
          </Name>
          <Hits>{t.admin.suggestedHits.replace('{count}', String(row.hits))}</Hits>
          <Actions>
            <Button type="button" variant="primary" onClick={() => onAdd(row)}>
              {t.admin.addCategory}
            </Button>
            <Button type="button" variant="secondary" onClick={() => dismiss(row.id)}>
              {t.admin.dismiss}
            </Button>
          </Actions>
        </Row>
      ))}
    </Box>
  )
}
