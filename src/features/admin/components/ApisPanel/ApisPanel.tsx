import { useState, type ReactNode } from 'react'
import { Badge } from '../../../../components/Badge/Badge'
import { LoaderShell } from '../../../../components/LoaderShell/LoaderShell'
import { Button } from '../../../../components/Button/Button'
import { ChoiceChips } from '../../../../components/ChoiceChips/ChoiceChips'
import { Segmented } from '../../../../components/Segmented/Segmented'
import { Switch } from '../../../../components/Switch/Switch'
import { useI18n } from '../../../../i18n/I18nProvider'
import { catalogName, optionLabel } from '../../../catalog/catalog'
import { sizeChoices, stageChoices } from '../../../greenhouse/plantClass'
import { CatalogSelect } from '../../../greenhouse/components/CatalogSelect/CatalogSelect'
import { STAGE_LABEL } from '../../../../mock/marketNaming'
import { parseIdentifySettings, stageSettings } from '../../../../mock/identifySettings'
import { useStore } from '../../../../mock/store'
import type {
  CatalogSuggestion,
  IdentifyMockMatch,
  IdentifyMockScenario,
  IdentifyProviderId,
  IdentifyProviderSettings,
  IdentifyProviderStatus,
  IdentifyProviderStatusKind,
  IdentifyStepId,
  PlantClassDraft,
  SizeBand,
  StageBand,
} from '../../../../mock/types'
import { identifyScenarios, formatWhen, providerNameKey, stepLabelKey } from '../../identifyLabels'
import { IdentifyStageFields } from '../IdentifyStageFields/IdentifyStageFields'
import { AdminSection } from '../AdminSection/AdminSection'
import { AdminDetailGrid } from '../AdminTable/AdminTable'
import {
  ChainLead,
  Controls,
  DocsLink,
  Empty,
  Fields,
  SaveError,
  MatchBlock,
  Panel,
  StatusLine,
  Toolbar,
} from './ApisPanel.styles'

const STAGES: IdentifyStepId[] = ['gate', 'species', 'draft']
const STAGE_PROVIDER: Record<IdentifyStepId, IdentifyProviderId> = {
  gate: 'gemini',
  species: 'plantnet',
  draft: 'gemini',
}
const GATE_SCENARIOS: IdentifyMockScenario[] = ['match', 'notPlant', 'error']
const stageLeadKey = {
  gate: 'apisStageGateLead',
  species: 'apisStageSpeciesLead',
  draft: 'apisStageDraftLead',
} as const satisfies Record<IdentifyStepId, string>
const SKIP_PROPERTIES = new Set(['health', 'size', 'stage', 'area'])

const statusLabelKey = {
  ready: 'apisStatusReady',
  missingKey: 'apisStatusMissingKey',
  exhausted: 'apisStatusExhausted',
  unreachable: 'apisStatusUnreachable',
} as const satisfies Record<IdentifyProviderStatusKind, string>

function statusTone(status: IdentifyProviderStatusKind): 'lime' | 'muted' | 'warn' | 'danger' {
  if (status === 'ready') return 'lime'
  if (status === 'exhausted') return 'warn'
  if (status === 'unreachable') return 'danger'
  return 'muted'
}

function formatCredits(
  id: IdentifyProviderId,
  credits: IdentifyProviderStatus['credits'],
  t: ReturnType<typeof useI18n>['t'],
): string | null {
  if (!credits) return null
  if (id === 'plantnet' && credits.remaining != null && credits.total != null) {
    return t.admin.apisCreditsOf
      .replace('{remaining}', String(credits.remaining))
      .replace('{total}', String(credits.total))
  }
  if (credits.remaining != null) {
    return t.admin.apisCreditsRemaining.replace('{remaining}', String(credits.remaining))
  }
  return null
}

function suggestionLabel(item: CatalogSuggestion) {
  const name = item.name || item.scientificName
  if (item.scientificName && item.scientificName !== name) return `${name} · ${item.scientificName}`
  return name || item.id
}

export function ApisPanel({
  providers,
  suggestions = [],
  onRefresh,
  onChange,
  saving,
  saveError,
  loading,
  catalogLoading,
}: {
  providers: IdentifyProviderStatus[]
  suggestions?: CatalogSuggestion[]
  onRefresh?: () => void
  /** Without it the controls are read-only. */
  onChange?: (id: IdentifyProviderId, patch: Partial<IdentifyProviderSettings>) => void
  /** Providers whose controls are being saved. */
  saving?: ReadonlySet<IdentifyProviderId>
  /** Last save failure for a provider, shown on the stages that use it. */
  saveError?: Partial<Record<IdentifyProviderId, string>>
  loading?: boolean
  /** Catalog rows are still arriving, so match fields wait. */
  catalogLoading?: boolean
}) {
  const { t } = useI18n()
  const [stage, setStage] = useState<IdentifyStepId>('gate')
  const providerId = STAGE_PROVIDER[stage]
  const active = providers.find((provider) => provider.id === providerId)
  const pending = Boolean(loading && !active)

  return (
    <Panel>
      <Toolbar>
        <ChainLead>{t.admin.apisChainLead}</ChainLead>
        {onRefresh && (
          <Button size="sm" variant="secondary" disabled={loading} onClick={onRefresh}>
            {t.admin.apisRefresh}
          </Button>
        )}
      </Toolbar>
      {!loading && providers.length === 0 ? (
        <Empty>{t.admin.apisEmpty}</Empty>
      ) : (
        <>
          <Segmented
            ariaLabel={t.admin.apis}
            value={stage}
            onChange={setStage}
            options={STAGES.map((id) => ({ id, label: t.admin[stepLabelKey[id]] }))}
          />
          <AdminSection title={t.admin[stepLabelKey[stage]]} lead={t.admin[stageLeadKey[stage]]}>
            <StatusLine>
              <Badge $tone={pending ? 'muted' : 'lime'}>
                {pending ? t.common.loading : active ? t.admin[providerNameKey[active.id]] : t.admin.apisLoaded}
              </Badge>
            </StatusLine>
            {pending ? (
              <LoaderShell />
            ) : !active ? (
              <Empty>{t.admin.apisEmpty}</Empty>
            ) : (
              <ProviderBody
                stage={stage}
                provider={active}
                suggestions={suggestions}
                catalogLoading={catalogLoading}
                locked={!onChange}
                busy={Boolean(saving?.has(active.id))}
                saveError={saveError?.[active.id]}
                onChange={(patch) => {
                  if (stage === 'species') {
                    onChange?.(active.id, patch)
                    return
                  }
                  const current = stageSettings(parseIdentifySettings(active.enabled, active), stage)
                  onChange?.(active.id, {
                    [stage]: {
                      enabled: patch.enabled ?? current.enabled,
                      response: patch.response ?? current.response,
                      scenario: patch.scenario ?? current.scenario,
                      suggestionId: patch.suggestionId ?? current.suggestionId,
                      match: patch.match ?? current.match,
                    },
                  })
                }}
              />
            )}
          </AdminSection>
        </>
      )}
    </Panel>
  )
}

function ProviderBody({
  stage,
  provider,
  suggestions,
  catalogLoading,
  locked,
  busy,
  saveError,
  onChange,
}: {
  stage: IdentifyStepId
  provider: IdentifyProviderStatus
  suggestions: CatalogSuggestion[]
  catalogLoading?: boolean
  locked: boolean
  busy: boolean
  saveError?: string
  onChange: (patch: Partial<IdentifyProviderSettings>) => void
}) {
  const { t, locale } = useI18n()
  const { db } = useStore()
  const catalog = db.catalog
  const stored = parseIdentifySettings(provider.enabled, provider)
  const settings = stage === 'species' ? stored : stageSettings(stored, stage)
  const scenarios = stage === 'gate' ? GATE_SCENARIOS : identifyScenarios
  const name = t.admin[providerNameKey[provider.id]]
  const credits = formatCredits(provider.id, provider.credits, t)
  const lastUsed = formatWhen(provider.lastUsedAt, locale)
  const items: { label: string; value: ReactNode }[] = [
    {
      label: t.admin.apisDocs,
      value: (
        <DocsLink href={provider.docsUrl} target="_blank" rel="noreferrer">
          {t.admin.apisDocs}
        </DocsLink>
      ),
    },
    {
      label: t.admin.apisKey,
      value: (
        <Badge $tone={provider.keySet ? 'lime' : 'danger'}>
          {provider.keySet ? t.admin.apisKeySet : t.admin.apisKeyMissing}
        </Badge>
      ),
    },
    {
      label: t.admin.apisStatus,
      value: (
        <Badge $tone={provider.status === 'ready' ? (settings.response === 'mock' ? 'muted' : 'lime') : statusTone(provider.status)}>
          {provider.status === 'ready'
            ? settings.response === 'mock'
              ? t.admin.apisResponseMock
              : t.admin.apisResponseReady
            : t.admin[statusLabelKey[provider.status]]}
        </Badge>
      ),
    },
  ]
  if (credits) items.push({ label: t.admin.apisCredits, value: credits })
  if (provider.id === 'gemini' && provider.model) items.push({ label: t.admin.apisModel, value: provider.model })
  if (provider.lastError) items.push({ label: t.admin.apisLastError, value: provider.lastError })
  if (lastUsed) items.push({ label: t.admin.apisLastUsed, value: lastUsed })

  const match = settings.match
  const categories = catalog.categories
  const categoryId = categories.some((item) => item.id === match.categoryId) ? match.categoryId : ''
  const subs = catalog.subcategories.filter((item) => item.categoryId === categoryId)
  const subcategoryId =
    match.subcategory && subs.some((item) => item.id === match.subcategoryId) ? match.subcategoryId : ''
  const sizeId = match.properties.size ?? ''
  const stageId = match.properties.stage ?? ''
  const classDraft: PlantClassDraft = {
    categoryId,
    subcategoryId,
    quality: '',
    size: sizeId as SizeBand | '',
    stage: stageId as StageBand | '',
    traits: match.properties,
  }
  const sizes = categoryId ? sizeChoices(catalog, classDraft) : []
  const stages = sizeId ? stageChoices(catalog, classDraft) : []
  const specTraits = categoryId
    ? catalog.properties.filter((item) => {
        if (SKIP_PROPERTIES.has(item.id)) return false
        if (item.categoryIds.includes(categoryId)) return true
        return item.subcategoryIds.some((id) => subs.some((sub) => sub.id === id))
      })
    : []
  const suggestionChoices = suggestions.filter(
    (item) => item.status === 'open' || item.id === settings.suggestionId,
  )

  const writeMatch = (match: IdentifyMockMatch) => onChange({ match })
  const setProperty = (propertyId: string, optionId: string) => {
    const properties = { ...match.properties }
    if (optionId) properties[propertyId] = optionId
    else delete properties[propertyId]
    if (propertyId === 'size') delete properties.stage
    writeMatch({ categoryId, subcategory: Boolean(subcategoryId), subcategoryId, properties })
  }

  return (
    <>
      <Controls>
        <Switch
          checked={settings.enabled}
          disabled={locked}
          busy={busy}
          busyLabel={t.admin.apisSaving}
          ariaLabel={`${name}: ${settings.enabled ? t.admin.systemEnabled : t.admin.systemDisabled}`}
          onChange={(enabled) => onChange({ enabled })}
          label={settings.enabled ? t.admin.systemEnabled : t.admin.systemDisabled}
        />
        <IdentifyStageFields
          stage={stage}
          response={settings.response}
          scenario={settings.scenario}
          scenarios={scenarios}
          disabled={locked}
          onResponse={(response) => onChange({ response })}
          onScenario={(scenario) => onChange({ scenario })}
        />
      </Controls>
      {saveError ? <SaveError role="alert">{saveError}</SaveError> : null}

      {stage === 'draft' && settings.response === 'mock' && settings.scenario === 'match' && (catalogLoading ? (
        <LoaderShell busy />
      ) : (
        <MatchBlock>
          <ChoiceChips
            label={t.admin.category}
            required
            disabled={locked}
            value={categoryId}
            options={categories.map((item) => ({ id: item.id, label: catalogName(item, locale) }))}
            onChange={(next) =>
              writeMatch({ categoryId: next, subcategory: false, subcategoryId: '', properties: {} })
            }
          />
          <ChoiceChips
            label={t.admin.subcategory}
            required
            disabled={locked || !categoryId}
            value={subcategoryId}
            options={
              categoryId ? subs.map((item) => ({ id: item.id, label: catalogName(item, locale), hint: item.code })) : []
            }
            onChange={(next) =>
              writeMatch({ categoryId, subcategory: true, subcategoryId: next, properties: {} })
            }
          />
          <ChoiceChips
            label={t.admin.size}
            required
            disabled={locked || !categoryId}
            value={sizes.includes(sizeId as SizeBand) ? sizeId : ''}
            options={sizes.map((id) => ({ id, label: id }))}
            onChange={(next) => setProperty('size', next)}
          />
          <ChoiceChips
            label={t.admin.stage}
            required
            disabled={locked || !sizeId}
            value={sizeId && stages.includes(stageId as StageBand) ? stageId : ''}
            options={stages.map((id) => ({ id, label: STAGE_LABEL[id]?.[locale] ?? id }))}
            onChange={(next) => setProperty('stage', next)}
          />
          {specTraits.map((property) => {
            const open = Boolean(stageId) && (
              property.subcategoryIds.length > 0
                ? property.subcategoryIds.includes(subcategoryId)
                : property.categoryIds.length === 0 || property.categoryIds.includes(categoryId)
            )
            return (
              <ChoiceChips
                key={property.id}
                label={catalogName(property, locale)}
                required={property.required}
                disabled={locked || !open}
                value={open ? (match.properties[property.id] ?? '') : ''}
                options={
                  open
                    ? property.options.map((option) => ({ id: option.id, label: optionLabel(option, locale) }))
                    : []
                }
                onChange={(next) => setProperty(property.id, next)}
              />
            )
          })}
        </MatchBlock>
      ))}

      {stage !== 'gate' && settings.response === 'mock' && settings.scenario === 'notInCatalog' && (
        <Fields>
          <CatalogSelect
            label={t.admin.apisSuggestion}
            value={settings.suggestionId}
            disabled={locked}
            chooseLabel={t.admin.apisSuggestionDefault}
            options={suggestionChoices.map((item) => ({ id: item.id, label: suggestionLabel(item) }))}
            onChange={(suggestionId) => onChange({ suggestionId })}
          />
        </Fields>
      )}

      <AdminDetailGrid items={items} />
    </>
  )
}
