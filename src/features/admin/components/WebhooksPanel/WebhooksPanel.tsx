import { useCallback, useEffect, useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Switch } from '../../../../components/Switch/Switch'
import { useI18n } from '../../../../i18n/I18nProvider'
import { formatApiFailure } from '../../../../lib/apiFailure'
import {
  fetchWebhooksOutcome,
  sendWebhookTestOutcome,
  setWebhookEnabledOutcome,
} from '../../../../mock/liveApi'
import { useStore } from '../../../../mock/store'
import type { WebhookId, WebhookStatus } from '../../../../mock/types'
import { Controls, Copy, Env, Item, Lead, List, Note, Root } from './WebhooksPanel.styles'

type AdminCopy = ReturnType<typeof useI18n>['t']['admin']

const NAME: Record<WebhookId, (a: AdminCopy) => [string, string]> = {
  alerts: (a) => [a.webhookAlertsName, a.webhookAlertsWhat],
  signups: (a) => [a.webhookSignupsName, a.webhookSignupsWhat],
  signins: (a) => [a.webhookSigninsName, a.webhookSigninsWhat],
  activities: (a) => [a.webhookActivitiesName, a.webhookActivitiesWhat],
}

/**
 * Admin → Webhooks: what each outgoing webhook sends, whether its env URL is set on this deployment
 * (never the URL), an on/off switch and Send test. GitHub's own webhook is listed for reference only.
 */
export function WebhooksView({
  webhooks,
  busy,
  notes,
  onToggle,
  onTest,
}: {
  webhooks: WebhookStatus[]
  busy: WebhookId | null
  notes: Partial<Record<WebhookId, { text: string; bad?: boolean }>>
  onToggle: (id: WebhookId, enabled: boolean) => void
  onTest: (id: WebhookId) => void
}) {
  const { t } = useI18n()
  const a = t.admin
  return (
    <List>
      {webhooks.map((hook) => {
        const [name, what] = NAME[hook.id](a)
        const note = notes[hook.id]
        return (
          <Item key={hook.id} data-webhook={hook.id}>
            <Copy>
              <strong>{name}</strong>
              <p>{what}</p>
              <Env $set={hook.configured} data-configured={hook.configured}>
                {(hook.configured ? a.webhooksSet : a.webhooksNotSet).split('{env}')[0]}
                <code>{hook.env}</code>
                {(hook.configured ? a.webhooksSet : a.webhooksNotSet).split('{env}')[1]}
              </Env>
              {note ? <Note $bad={note.bad} role="status">{note.text}</Note> : null}
            </Copy>
            <Controls>
              <Switch
                checked={hook.enabled}
                onChange={(next) => onToggle(hook.id, next)}
                label={hook.enabled ? a.webhooksOn : a.webhooksOff}
                ariaLabel={name}
                busy={busy === hook.id}
                busyLabel={t.common.loading}
                disabled={busy !== null}
              />
              <Button
                variant="secondary"
                size="sm"
                type="button"
                disabled={!hook.configured || busy !== null}
                onClick={() => onTest(hook.id)}
              >
                {a.webhooksTest}
              </Button>
            </Controls>
          </Item>
        )
      })}
      <Item data-webhook="github">
        <Copy>
          <strong>{a.webhookGithubName}</strong>
          <p>{a.webhookGithubWhat}</p>
        </Copy>
      </Item>
    </List>
  )
}

export function WebhooksPanel() {
  const { t } = useI18n()
  const a = t.admin
  const { plantxEnv } = useStore()
  const [webhooks, setWebhooks] = useState<WebhookStatus[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<WebhookId | null>(null)
  const [notes, setNotes] = useState<Partial<Record<WebhookId, { text: string; bad?: boolean }>>>({})

  const load = useCallback(async () => {
    const res = await fetchWebhooksOutcome()
    if (res.ok) {
      setWebhooks(res.data.webhooks)
      setError(null)
    } else setError(formatApiFailure(res.failure, a))
  }, [a])

  useEffect(() => {
    if (plantxEnv !== 'mock') void load()
  }, [load, plantxEnv])

  const toggle = async (id: WebhookId, enabled: boolean) => {
    setBusy(id)
    const res = await setWebhookEnabledOutcome(id, enabled)
    if (res.ok) {
      setWebhooks(res.data.webhooks)
      setNotes((current) => ({ ...current, [id]: undefined }))
    } else {
      setNotes((current) => ({ ...current, [id]: { text: a.webhooksSaveFailed.replace('{detail}', formatApiFailure(res.failure, a)), bad: true } }))
    }
    setBusy(null)
  }

  const test = async (id: WebhookId) => {
    setBusy(id)
    const res = await sendWebhookTestOutcome(id)
    setNotes((current) => ({
      ...current,
      [id]: res.ok
        ? { text: a.webhooksTestSent }
        : { text: a.webhooksTestFailed.replace('{detail}', formatApiFailure(res.failure, a)), bad: true },
    }))
    setBusy(null)
  }

  return (
    <Root aria-labelledby="webhooks-title" data-webhooks>
      <h2 id="webhooks-title">{a.webhooksTitle}</h2>
      <Lead>{a.webhooksLead}</Lead>
      {plantxEnv === 'mock' ? <Note>{a.webhooksMock}</Note> : null}
      {error ? <Note $bad>{error}</Note> : null}
      {plantxEnv !== 'mock' && !webhooks && !error ? <Note role="status">{a.webhooksLoading}</Note> : null}
      {webhooks ? (
        <WebhooksView webhooks={webhooks} busy={busy} notes={notes} onToggle={(id, next) => void toggle(id, next)} onTest={(id) => void test(id)} />
      ) : null}
    </Root>
  )
}
