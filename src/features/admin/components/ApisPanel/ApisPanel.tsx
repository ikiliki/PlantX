import type { ReactNode } from 'react'
import { Badge } from '../../../../components/Badge/Badge'
import { Button } from '../../../../components/Button/Button'
import { Switch } from '../../../../components/Switch/Switch'
import { useI18n } from '../../../../i18n/I18nProvider'
import type {
  IdentifyCredits,
  IdentifyProviderId,
  IdentifyProviderStatus,
  IdentifyProviderStatusKind,
} from '../../../../mock/types'
import { formatWhen, providerNameKey } from '../../identifyLabels'
import { AdminSection } from '../AdminSection/AdminSection'
import { AdminDetailGrid } from '../AdminTable/AdminTable'
import { ChainLead, DocsLink, Empty, Panel, Toolbar } from './ApisPanel.styles'

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
  credits: IdentifyCredits | undefined,
  t: ReturnType<typeof useI18n>['t'],
): string | null {
  if (!credits) return null
  if (id === 'plantid') {
    const parts: string[] = []
    if (credits.remaining != null) {
      parts.push(t.admin.apisCreditsRemaining.replace('{remaining}', String(credits.remaining)))
    }
    if (credits.used != null) {
      parts.push(t.admin.apisCreditsUsed.replace('{used}', String(credits.used)))
    }
    return parts.length ? parts.join(' · ') : null
  }
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

export function ApisPanel({
  providers,
  onRefresh,
  onEnabledChange,
  saving,
  loading,
}: {
  providers: IdentifyProviderStatus[]
  onRefresh?: () => void
  /** Without it the switch is read-only. */
  onEnabledChange?: (id: IdentifyProviderId, enabled: boolean) => void
  /** Providers whose switch is being saved. */
  saving?: ReadonlySet<IdentifyProviderId>
  loading?: boolean
}) {
  const { t, locale } = useI18n()
  const sorted = [...providers].sort((a, b) => a.order - b.order)

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
      {sorted.length === 0 ? (
        <Empty>{t.admin.apisEmpty}</Empty>
      ) : (
        sorted.map((provider) => {
          const nameKey = providerNameKey[provider.id]
          const credits = formatCredits(provider.id, provider.credits, t)
          const lastUsed = formatWhen(provider.lastUsedAt, locale)
          const items: { label: string; value: ReactNode }[] = [
            {
              label: t.admin.apisOrder,
              value: String(provider.order),
            },
            {
              label: t.admin.apisReturns,
              value: provider.returns,
            },
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

          if (credits) {
            items.push({ label: t.admin.apisCredits, value: credits })
          }
          if (provider.id === 'gemini' && provider.model) {
            items.push({ label: t.admin.apisModel, value: provider.model })
          }
          if (provider.lastError) {
            items.push({ label: t.admin.apisLastError, value: provider.lastError })
          }
          if (lastUsed) {
            items.push({ label: t.admin.apisLastUsed, value: lastUsed })
          }

          const name = t.admin[nameKey]
          return (
            <AdminSection
              key={provider.id}
              title={name}
              aside={
                <Switch
                  checked={provider.enabled}
                  disabled={!onEnabledChange}
                  busy={saving?.has(provider.id)}
                  busyLabel={t.admin.apisSaving}
                  ariaLabel={`${name}: ${t.admin.apisEnabledOn}`}
                  onChange={(next) => onEnabledChange?.(provider.id, next)}
                  label={provider.enabled ? t.admin.apisEnabledOn : t.admin.apisEnabledOff}
                />
              }
            >
              <AdminDetailGrid items={items} />
            </AdminSection>
          )
        })
      )}
    </Panel>
  )
}
