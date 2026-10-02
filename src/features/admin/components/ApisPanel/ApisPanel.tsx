import { useState, type ReactNode } from 'react'
import { Badge } from '../../../../components/Badge/Badge'
import { LoaderShell } from '../../../../components/LoaderShell/LoaderShell'
import { Button } from '../../../../components/Button/Button'
import { Segmented } from '../../../../components/Segmented/Segmented'
import { Switch } from '../../../../components/Switch/Switch'
import { useI18n } from '../../../../i18n/I18nProvider'
import { catalogName, optionLabel, propertiesForPlant } from '../../../catalog/catalog'
import { CatalogSelect } from '../../../greenhouse/components/CatalogSelect/CatalogSelect'
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
  MatchBlock,
  Panel,
  StatusLine,
  Subhead,
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
const SKIP_PROPERTIES = new Set(['area'])

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
                locked={!onChange || Boolean(saving?.has(active.id))}
                busy={Boolean(saving?.has(active.id))}
                onChange={(patch) => {
                  if (stage === 'species') {
                    onChange?.(active.id, patch)
                    return
                  }
                  const current = stageSettings(parseIdentifySettings(active.enabled, active), stage)
                  onChange?.(active.id, { [stage]: { ...current, ...patch, match: patch.match ?? current.match } })
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
  onChange,
}: {
  stage: IdentifyStepId
  provider: IdentifyProviderStatus
  suggestions: CatalogSuggestion[]
  catalogLoading?: boolean
  locked: boolean
  busy: boolean
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
        <Badge $tone={statusTone(provider.status)}>
          {t.admin[statusLabelKey[provider.status]]}
        </Badge>
      ),
    },
  ]
  if (credits) items.push({ label: t.admin.apisCredits, value: credits })
  if (provider.id === 'gemini' && provider.model) items.push({ label: t.admin.apisModel, value: provider.model })
  if (provider.lastError) items.push({ label: t.admin.apisLastError, value: provider.lastError })
  if (lastUsed) items.push({ label: t.admin.apisLastUsed, value: lastUsed })

  const categories = catalog.categories
  const categoryId = categories.some((item) => item.id === settings.match.categoryId)
    ? settings.match.categoryId
    : (categories[0]?.id ?? '')
  const subs = catalog.subcategories.filter((item) => item.categoryId === categoryId)
  const subcategoryId = subs.some((item) => item.id === settings.match.subcategoryId)
    ? settings.match.subcategoryId
    : (subs[0]?.id ?? '')
  const matchBase = (): IdentifyMockMatch => ({
    categoryId,
    subcategory: settings.match.subcategory,
    subcategoryId,
    properties: settings.match.properties,
  })
  const subForProps = settings.match.subcategory ? subcategoryId : ''
  const requiredProps = propertiesForPlant(catalog, categoryId, subForProps, true).filter(
    (item) => !SKIP_PROPERTIES.has(item.id),
  )
  const moreProps = propertiesForPlant(catalog, categoryId, subForProps, false).filter(
    (item) => !SKIP_PROPERTIES.has(item.id),
  )
  const suggestionChoices = suggestions.filter(
    (item) => item.status === 'open' || item.id === settings.suggestionId,
  )

  const setProperty = (propertyId: string, optionId: string) => {
    const properties = { ...settings.match.properties }
    if (optionId) properties[propertyId] = optionId
    else delete properties[propertyId]
    onChange({ match: { ...matchBase(), properties } })
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

      {stage === 'draft' && settings.response === 'mock' && settings.scenario === 'match' && (catalogLoading ? (
        <LoaderShell busy />
      ) : (
        <MatchBlock>
          <Fields>
            <CatalogSelect
              label={t.admin.category}
              value={categoryId}
              disabled={locked}
              chooseLabel={t.admin.apisPropertyNone}
              options={categories.map((item) => ({ id: item.id, label: catalogName(item, locale) }))}
              onChange={(next) =>
                onChange({
                  match: { categoryId: next, subcategory: settings.match.subcategory, subcategoryId: '', properties: {} },
                })
              }
            />
          </Fields>
          {subs.length > 0 && (
            <Switch
              checked={settings.match.subcategory}
              disabled={locked}
              ariaLabel={t.admin.subcategory}
              onChange={(subcategory) => onChange({ match: { ...matchBase(), subcategory } })}
              label={settings.match.subcategory ? t.admin.apisSubcategoryOn : t.admin.apisSubcategoryOff}
            />
          )}
          {settings.match.subcategory && subs.length > 0 && (
            <Fields>
              <CatalogSelect
                label={t.admin.subcategory}
                value={subcategoryId}
                disabled={locked}
                chooseLabel={t.admin.apisPropertyNone}
                options={subs.map((item) => ({ id: item.id, label: catalogName(item, locale) }))}
                onChange={(next) => onChange({ match: { ...matchBase(), subcategoryId: next } })}
              />
            </Fields>
          )}
          {requiredProps.length > 0 && (
            <>
              <Subhead>{t.admin.properties}</Subhead>
              <Fields>
                {requiredProps.map((property) => (
                  <CatalogSelect
                    key={property.id}
                    label={catalogName(property, locale)}
                    value={settings.match.properties[property.id] ?? ''}
                    disabled={locked}
                    chooseLabel={t.admin.apisPropertyNone}
                    options={property.options.map((option) => ({
                      id: option.id,
                      label: optionLabel(option, locale),
                    }))}
                    onChange={(next) => setProperty(property.id, next)}
                  />
                ))}
              </Fields>
            </>
          )}
          {moreProps.length > 0 && (
            <>
              <Subhead>{t.greenhouse.moreProperties}</Subhead>
              <Fields>
                {moreProps.map((property) => (
                  <CatalogSelect
                    key={property.id}
                    label={catalogName(property, locale)}
                    value={settings.match.properties[property.id] ?? ''}
                    disabled={locked}
                    chooseLabel={t.admin.apisPropertyNone}
                    options={property.options.map((option) => ({
                      id: option.id,
                      label: optionLabel(option, locale),
                    }))}
                    onChange={(next) => setProperty(property.id, next)}
                  />
                ))}
              </Fields>
            </>
          )}
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
