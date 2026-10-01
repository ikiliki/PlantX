import { useEffect, useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Field, FormOption, FormOptionGrid, FormSection } from '../../../../components/Form/Form'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { Listing, Plant } from '../../../../mock/types'
import type { ListingFilterMeta } from '../../listingFilterMeta'
import { emptyCustomFilters, type MarketFilterState } from '../../marketFilters'
import { CatalogOthersFilters } from '../../../catalog/components/CatalogOthersFilters/CatalogOthersFilters'
import {
  Backdrop,
  Check,
  CheckGrid,
  Close,
  Dialog,
  Footer,
  Reset,
  Title,
} from './MarketFiltersDialog.styles'

function toggle<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]
}

export function MarketFiltersDialog({
  value,
  meta,
  onApply,
  onClose,
  listingOnly = false,
}: {
  value: MarketFilterState
  meta: ListingFilterMeta
  onApply: (next: MarketFilterState) => void
  onClose: () => void
  /** When true, only listing checkboxes / rooting / form (opened from “More filters”). */
  listingOnly?: boolean
}) {
  const { t } = useI18n()
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const patch = (partial: Partial<MarketFilterState>) => setDraft((current) => ({ ...current, ...partial }))

  const rootingLabel = (v: Plant['rooting']) => {
    if (v === 'rooted') return t.market.rooted
    if (v === 'unrooted') return t.market.unrooted
    return t.market.established
  }

  const unitLabel = (v: Listing['unit']) => {
    if (v === 'cutting') return t.market.unitCutting
    if (v === 'bundle') return t.market.bundle
    return t.market.unitPlant
  }

  const clearCustom = () => {
    setDraft((current) => ({ ...current, ...emptyCustomFilters }))
  }

  return (
    <Backdrop onClick={onClose}>
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="market-filters-title"
        onClick={(event) => event.stopPropagation()}
      >
        <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
          ×
        </Close>
        <Title id="market-filters-title">
          {listingOnly ? t.market.moreFiltersTitle : t.market.filters}
        </Title>

        {meta.othersGroups.length > 0 && (
          <CatalogOthersFilters
            showHeading={false}
            traits={draft.traits}
            groups={meta.othersGroups}
            onTraitsChange={(traits) => patch({ traits })}
          />
        )}

        <FormSection title={t.market.listingTraits}>
          <CheckGrid>
            {meta.withPhoto > 0 && (
              <Check>
                <span>
                  {t.market.withPhoto} ({meta.withPhoto})
                </span>
                <input
                  type="checkbox"
                  checked={draft.withPhoto}
                  onChange={(event) => patch({ withPhoto: event.target.checked })}
                />
              </Check>
            )}
            {meta.verified > 0 && (
              <Check>
                <span>
                  {t.market.verified} ({meta.verified})
                </span>
                <input
                  type="checkbox"
                  checked={draft.verified}
                  onChange={(event) => patch({ verified: event.target.checked })}
                />
              </Check>
            )}
            {meta.pickupOnly > 0 && (
              <Check>
                <span>
                  {t.market.pickup} ({meta.pickupOnly})
                </span>
                <input
                  type="checkbox"
                  checked={draft.pickupOnly}
                  onChange={(event) => patch({ pickupOnly: event.target.checked })}
                />
              </Check>
            )}
            {meta.offers > 0 && (
              <Check>
                <span>
                  {t.market.openToOffers} ({meta.offers})
                </span>
                <input
                  type="checkbox"
                  checked={draft.offers}
                  onChange={(event) => patch({ offers: event.target.checked })}
                />
              </Check>
            )}
          </CheckGrid>
          {meta.rooting.length > 0 && (
            <Field>
              {t.market.rooting}
              <FormOptionGrid>
                {meta.rooting.map((item) => (
                  <FormOption
                    key={item.id}
                    type="button"
                    $on={draft.rooting.includes(item.id)}
                    onClick={() => patch({ rooting: toggle(draft.rooting, item.id) })}
                  >
                    {rootingLabel(item.id)} · {item.count}
                  </FormOption>
                ))}
              </FormOptionGrid>
            </Field>
          )}
          {meta.units.length > 0 && (
            <Field>
              {t.market.form}
              <FormOptionGrid>
                {meta.units.map((item) => (
                  <FormOption
                    key={item.id}
                    type="button"
                    $on={draft.units.includes(item.id)}
                    onClick={() => patch({ units: toggle(draft.units, item.id) })}
                  >
                    {unitLabel(item.id)} · {item.count}
                  </FormOption>
                ))}
              </FormOptionGrid>
            </Field>
          )}
        </FormSection>

        <Footer>
          <Button type="button" onClick={() => onApply(draft)}>
            {t.market.apply}
          </Button>
          <Reset type="button" onClick={clearCustom}>
            {t.market.clearFilters}
          </Reset>
        </Footer>
      </Dialog>
    </Backdrop>
  )
}
