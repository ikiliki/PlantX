import type { ReactNode } from 'react'
import { Badge } from '../../../../components/Badge/Badge'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { Catalog, IdentifyRequestRecord, Locale, PlantClassDraft } from '../../../../mock/types'
import { catalogName, categoryById, optionLabel, propertyById, subcategoryById } from '../../../catalog/catalog'
import {
  modeLabelKey,
  modeTone,
  providerNameKey,
  requestStatusKey,
  requestStatusTone,
  scenarioLabelKey,
  skipLabelKey,
  targetLabelKey,
} from '../../identifyLabels'
import { AdminDetailGrid } from '../AdminTable/AdminTable'
import { Answer, Badges, Block, Problem, Raw, Root, Subhead, TriedList } from './IdentifyResult.styles'

type DetailItem = { label: string; value: ReactNode }

function optionText(catalog: Catalog, propertyId: string, value: string, locale: Locale) {
  const option = propertyById(catalog, propertyId)?.options.find((item) => item.id === value)
  return option ? optionLabel(option, locale) : value
}

function mappedItems(
  catalog: Catalog,
  draft: Partial<PlantClassDraft>,
  locale: Locale,
  t: ReturnType<typeof useI18n>['t'],
): DetailItem[] {
  const category = draft.categoryId ? categoryById(catalog, draft.categoryId) : undefined
  if (!category) return []
  const sub = draft.subcategoryId ? subcategoryById(catalog, draft.subcategoryId) : undefined
  const items: DetailItem[] = [{ label: t.admin.category, value: catalogName(category, locale) }]
  if (sub) items.push({ label: t.admin.subcategory, value: catalogName(sub, locale) })
  if (draft.quality) {
    items.push({ label: t.admin.grade, value: optionText(catalog, 'grade', draft.quality, locale) })
  }
  if (draft.size) {
    items.push({ label: t.admin.size, value: optionText(catalog, 'size', draft.size, locale) })
  }
  if (draft.stage) {
    items.push({ label: t.admin.stage, value: optionText(catalog, 'stage', draft.stage, locale) })
  }
  for (const [propertyId, value] of Object.entries(draft.traits ?? {})) {
    const property = propertyById(catalog, propertyId)
    items.push({
      label: property ? catalogName(property, locale) : propertyId,
      value: optionText(catalog, propertyId, value, locale),
    })
  }
  return items
}

function rawRecord(record: IdentifyRequestRecord) {
  const thumb = record.thumb?.startsWith('data:') ? `${record.thumb.slice(0, 40)}…` : record.thumb
  return JSON.stringify({ ...record, thumb }, null, 2)
}

export function IdentifyResult({
  record,
  error,
}: {
  record: IdentifyRequestRecord
  /** Transport error when no provider answered, e.g. `offline`. */
  error?: string
}) {
  const { t, locale } = useI18n()
  const { db } = useStore()
  const diagnosis = record.diagnosis
  const tried = diagnosis?.tried.length ? diagnosis.tried : record.tried

  const facts: DetailItem[] = []
  if (diagnosis) {
    facts.push(
      { label: t.admin.apisAnsweredBy, value: t.admin[providerNameKey[diagnosis.provider]] },
      { label: t.admin.apisProbability, value: `${Math.round(diagnosis.probability * 100)}%` },
      { label: t.admin.apisIsPlant, value: diagnosis.isPlant ? t.admin.apisYes : t.admin.apisNo },
    )
    if (diagnosis.scientificName) {
      facts.push({ label: t.admin.apisScientific, value: diagnosis.scientificName })
    }
    if (diagnosis.commonNames.length) {
      facts.push({ label: t.admin.apisCommonNames, value: diagnosis.commonNames.join(', ') })
    }
  }
  facts.push({ label: t.admin.apisDuration, value: `${record.durationMs} ms` })

  const mapped = diagnosis ? mappedItems(db.catalog, diagnosis.draft, locale, t) : []

  return (
    <Root>
      <Badges>
        <Badge $tone={requestStatusTone(record.status)}>{t.admin[requestStatusKey[record.status]]}</Badge>
        <Badge $tone={modeTone(record.mode)}>{t.admin[modeLabelKey[record.mode]]}</Badge>
        <Badge $tone="muted">{t.admin[targetLabelKey[record.target]]}</Badge>
        {record.mode === 'mock' && record.scenario && (
          <Badge $tone="muted">{t.admin[scenarioLabelKey[record.scenario]]}</Badge>
        )}
      </Badges>

      {diagnosis?.label && (
        <Answer>
          <strong>{diagnosis.label}</strong>
          {diagnosis.scientificName && diagnosis.scientificName !== diagnosis.label && (
            <em>{diagnosis.scientificName}</em>
          )}
        </Answer>
      )}
      {error && <Problem>{error}</Problem>}

      <AdminDetailGrid items={facts} />

      {diagnosis?.isPlant && (
        <Block>
          <Subhead>{t.admin.apisMapped}</Subhead>
          {mapped.length ? (
            <AdminDetailGrid items={mapped} />
          ) : (
            <Badges>
              <Badge $tone="warn">{t.admin.apisNotMapped}</Badge>
            </Badges>
          )}
        </Block>
      )}

      {tried.length > 0 && (
        <Block>
          <Subhead>{t.admin.apisTried}</Subhead>
          <TriedList>
            {tried.map((item) => (
              <li key={item.provider}>
                <strong>{t.admin[providerNameKey[item.provider]]}</strong>
                <Badge $tone={item.reason === 'missingKey' ? 'muted' : 'warn'}>
                  {t.admin[skipLabelKey[item.reason]]}
                </Badge>
                {item.detail && <small>{item.detail}</small>}
              </li>
            ))}
          </TriedList>
        </Block>
      )}

      <Raw>
        <summary>{t.admin.apisRaw}</summary>
        <pre>{rawRecord(record)}</pre>
      </Raw>
    </Root>
  )
}
