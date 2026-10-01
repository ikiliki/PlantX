import { useEffect, useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { dismissCatalogSuggestion, fetchCatalogSuggestions } from '../../../../mock/liveApi'
import type { CatalogSuggestion } from '../../../../mock/types'
import { Actions, Box, Head, Hits, Name, Row, Thumb } from './CatalogSuggestions.styles'

/** Open identify hits that matched no category. Stories pass `items` and skip the server. */
export function CatalogSuggestions({
  items,
  refreshKey = 0,
  showEmpty = false,
  onAdd,
  onDismiss,
}: {
  items?: CatalogSuggestion[]
  refreshKey?: number
  /** Keep the heading when nothing is open. */
  showEmpty?: boolean
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

  if (rows.length === 0 && !showEmpty) return null

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
          {row.draft?.category?.photo ? (
            <Thumb>
              <PlantImage src={row.draft.category.photo} alt="" />
            </Thumb>
          ) : null}
          <Name>
            <strong>{row.name}</strong>
            {row.scientificName && row.scientificName !== row.name ? <small>{row.scientificName}</small> : null}
          </Name>
          <Hits>{t.admin.suggestedHits.replace('{count}', String(row.hits))}</Hits>
          <Actions>
            <Button type="button" variant="primary" onClick={() => onAdd(row)}>
              {t.admin.suggestedReview}
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
