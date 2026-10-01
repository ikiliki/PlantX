import { useEffect, useRef, useState, type RefObject } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import { RADIUS_KM } from '../../../../mock/locations'
import type { ListingFilterMeta } from '../../../market/listingFilterMeta'
import type { MarketFilterState, PriceBandId } from '../../../market/marketFilters'
import {
  Bar,
  Choice,
  ChoiceRow,
  Menu,
  Pill,
  PillWrap,
} from '../../../market/components/MarketSearch/MarketSearch.styles'

type MenuId = 'species' | 'subcategory' | 'grade' | 'size' | 'stage' | 'area' | 'radius' | 'price' | string

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden style={{ transform: open ? 'rotate(180deg)' : undefined }}>
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function toggleValue<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item]
}

/** Catalog dropdown pills shared by market search and admin configurations. */
export function CatalogFilterPills({
  filters,
  meta,
  onChange,
  showLocation = false,
  inline = false,
  containerRef,
}: {
  filters: MarketFilterState
  meta: ListingFilterMeta
  onChange: (next: MarketFilterState) => void
  showLocation?: boolean
  /** When true, omit outer bar wrapper (nested inside market search row). */
  inline?: boolean
  containerRef?: RefObject<HTMLDivElement | null>
}) {
  const { t } = useI18n()
  const localRef = useRef<HTMLDivElement>(null)
  const barRef = containerRef ?? localRef
  const [menu, setMenu] = useState<MenuId | null>(null)

  const patch = (partial: Partial<MarketFilterState>) => onChange({ ...filters, ...partial })
  useEffect(() => {
    if (!menu) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu(null)
    }
    const onPointer = (event: PointerEvent) => {
      if (!barRef.current?.contains(event.target as Node)) setMenu(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [menu])

  const priceLabel = (band: PriceBandId) => {
    if (band === 'under-100') return t.market.priceUnder
    if (band === '100-500') return t.market.priceMid
    return t.market.priceOver
  }

  const speciesName = meta.species.find((item) => item.id === filters.speciesId)?.name
  const areaName = meta.areas.find((area) => area.id === filters.areaId)?.name
  const subLabel =
    filters.subcategoryIds.length === 0
      ? t.market.filterSubcategory
      : filters.subcategoryIds
          .map((id) => meta.subcategories.find((item) => item.id === id)?.name ?? id)
          .join(', ')

  const toggleMenu = (id: MenuId) => setMenu((current) => (current === id ? null : id))

  const pills = (
    <>
      <PillWrap>
        <Pill
          type="button"
          $on={Boolean(speciesName) || menu === 'species'}
          aria-expanded={menu === 'species'}
          onClick={() => toggleMenu('species')}
        >
          <span>{speciesName || t.market.filterCategories}</span>
          <Chevron open={menu === 'species'} />
        </Pill>
        {menu === 'species' && (
          <Menu>
            <ChoiceRow>
              <Choice
                type="button"
                $on={!filters.speciesId}
                onClick={() => {
                  patch({ speciesId: '', subcategoryIds: [], traits: {} })
                  setMenu(null)
                }}
              >
                {t.market.all}
              </Choice>
              {meta.species.map((item) => (
                <Choice
                  key={item.id}
                  type="button"
                  $on={filters.speciesId === item.id}
                  onClick={() => {
                    patch({
                      speciesId: filters.speciesId === item.id ? '' : item.id,
                      subcategoryIds: [],
                      traits: {},
                    })
                    setMenu(null)
                  }}
                >
                  {item.name} {item.count}
                </Choice>
              ))}
            </ChoiceRow>
          </Menu>
        )}
      </PillWrap>

      <PillWrap>
        <Pill
          type="button"
          $on={filters.subcategoryIds.length > 0 || menu === 'subcategory'}
          aria-expanded={menu === 'subcategory'}
          onClick={() => toggleMenu('subcategory')}
        >
          <span>{subLabel}</span>
          <Chevron open={menu === 'subcategory'} />
        </Pill>
        {menu === 'subcategory' && (
          <Menu>
            <ChoiceRow>
              <Choice
                type="button"
                $on={filters.subcategoryIds.length === 0}
                onClick={() => patch({ subcategoryIds: [], traits: {} })}
              >
                {t.market.all}
              </Choice>
              {meta.subcategories.map((item) => (
                <Choice
                  key={item.id}
                  type="button"
                  $on={filters.subcategoryIds.includes(item.id)}
                  onClick={() =>
                    patch({
                      subcategoryIds: toggleValue(filters.subcategoryIds, item.id),
                      traits: {},
                    })
                  }
                >
                  {item.name} {item.count}
                </Choice>
              ))}
            </ChoiceRow>
          </Menu>
        )}
      </PillWrap>

      <PillWrap>
        <Pill
          type="button"
          $on={filters.grades.length > 0 || menu === 'grade'}
          aria-expanded={menu === 'grade'}
          onClick={() => toggleMenu('grade')}
        >
          <span>{filters.grades.length > 0 ? filters.grades.join(', ') : t.market.filterGrade}</span>
          <Chevron open={menu === 'grade'} />
        </Pill>
        {menu === 'grade' && (
          <Menu>
            <ChoiceRow>
              <Choice type="button" $on={filters.grades.length === 0} onClick={() => patch({ grades: [] })}>
                {t.market.all}
              </Choice>
              {meta.grades.map((grade) => (
                <Choice
                  key={grade.id}
                  type="button"
                  $on={filters.grades.includes(grade.id)}
                  onClick={() => patch({ grades: toggleValue(filters.grades, grade.id) })}
                >
                  {grade.id} {grade.count}
                </Choice>
              ))}
            </ChoiceRow>
          </Menu>
        )}
      </PillWrap>

      <PillWrap>
        <Pill
          type="button"
          $on={filters.sizes.length > 0 || menu === 'size'}
          aria-expanded={menu === 'size'}
          onClick={() => toggleMenu('size')}
        >
          <span>{filters.sizes.length > 0 ? filters.sizes.join(', ') : t.market.size}</span>
          <Chevron open={menu === 'size'} />
        </Pill>
        {menu === 'size' && (
          <Menu>
            <ChoiceRow>
              <Choice type="button" $on={filters.sizes.length === 0} onClick={() => patch({ sizes: [] })}>
                {t.market.all}
              </Choice>
              {meta.sizes.map((size) => (
                <Choice
                  key={size.id}
                  type="button"
                  $on={filters.sizes.includes(size.id)}
                  onClick={() => patch({ sizes: toggleValue(filters.sizes, size.id) })}
                >
                  {size.id} {size.count}
                </Choice>
              ))}
            </ChoiceRow>
          </Menu>
        )}
      </PillWrap>

      <PillWrap>
        <Pill
          type="button"
          $on={filters.stages.length > 0 || menu === 'stage'}
          aria-expanded={menu === 'stage'}
          onClick={() => toggleMenu('stage')}
        >
          <span>
            {filters.stages.length > 0
              ? filters.stages.map((id) => meta.stages.find((item) => item.id === id)?.name ?? id).join(', ')
              : t.market.stage}
          </span>
          <Chevron open={menu === 'stage'} />
        </Pill>
        {menu === 'stage' && (
          <Menu>
            <ChoiceRow>
              <Choice type="button" $on={filters.stages.length === 0} onClick={() => patch({ stages: [] })}>
                {t.market.all}
              </Choice>
              {meta.stages.map((stage) => (
                <Choice
                  key={stage.id}
                  type="button"
                  $on={filters.stages.includes(stage.id)}
                  onClick={() => patch({ stages: toggleValue(filters.stages, stage.id) })}
                >
                  {stage.name} {stage.count}
                </Choice>
              ))}
            </ChoiceRow>
          </Menu>
        )}
      </PillWrap>

      {showLocation && (
        <>
          <PillWrap>
            <Pill
              type="button"
              $on={Boolean(areaName) || menu === 'area'}
              aria-expanded={menu === 'area'}
              onClick={() => toggleMenu('area')}
            >
              <span>{areaName || t.market.filterArea}</span>
              <Chevron open={menu === 'area'} />
            </Pill>
            {menu === 'area' && (
              <Menu>
                <ChoiceRow>
                  <Choice
                    type="button"
                    $on={!filters.areaId}
                    onClick={() => {
                      patch({ areaId: '' })
                      setMenu(null)
                    }}
                  >
                    {t.market.all}
                  </Choice>
                  {meta.areas.map((area) => (
                    <Choice
                      key={area.id}
                      type="button"
                      $on={filters.areaId === area.id}
                      onClick={() => {
                        patch({ areaId: filters.areaId === area.id ? '' : area.id })
                        setMenu(null)
                      }}
                    >
                      {area.name} {area.count}
                    </Choice>
                  ))}
                </ChoiceRow>
              </Menu>
            )}
          </PillWrap>

          <PillWrap>
            <Pill
              type="button"
              $on={filters.radiusKm != null || menu === 'radius'}
              aria-expanded={menu === 'radius'}
              onClick={() => toggleMenu('radius')}
            >
              <span>
                {filters.radiusKm != null ? `${filters.radiusKm} ${t.market.km}` : t.market.filterRadius}
              </span>
              <Chevron open={menu === 'radius'} />
            </Pill>
            {menu === 'radius' && (
              <Menu $flip>
                <ChoiceRow>
                  <Choice
                    type="button"
                    $on={filters.radiusKm == null}
                    onClick={() => {
                      patch({ radiusKm: null })
                      setMenu(null)
                    }}
                  >
                    {t.market.anyDistance}
                  </Choice>
                  {RADIUS_KM.map((km) => (
                    <Choice
                      key={km}
                      type="button"
                      $on={filters.radiusKm === km}
                      onClick={() => {
                        patch({ radiusKm: filters.radiusKm === km ? null : km })
                        setMenu(null)
                      }}
                    >
                      {km} {t.market.km}
                    </Choice>
                  ))}
                </ChoiceRow>
              </Menu>
            )}
          </PillWrap>

          <PillWrap>
            <Pill
              type="button"
              $on={Boolean(filters.priceBand) || menu === 'price'}
              aria-expanded={menu === 'price'}
              onClick={() => toggleMenu('price')}
            >
              <span>{filters.priceBand ? priceLabel(filters.priceBand) : t.market.price}</span>
              <Chevron open={menu === 'price'} />
            </Pill>
            {menu === 'price' && (
              <Menu $flip>
                <ChoiceRow>
                  <Choice
                    type="button"
                    $on={!filters.priceBand}
                    onClick={() => {
                      patch({ priceBand: '' })
                      setMenu(null)
                    }}
                  >
                    {t.market.priceAny}
                  </Choice>
                  {meta.priceBands.map((band) => (
                    <Choice
                      key={band.id}
                      type="button"
                      $on={filters.priceBand === band.id}
                      onClick={() => {
                        patch({ priceBand: filters.priceBand === band.id ? '' : band.id })
                        setMenu(null)
                      }}
                    >
                      {priceLabel(band.id)} {band.count}
                    </Choice>
                  ))}
                </ChoiceRow>
              </Menu>
            )}
          </PillWrap>
        </>
      )}
    </>
  )

  if (inline) return pills

  return (
    <Bar ref={barRef}>
      {pills}
    </Bar>
  )
}
