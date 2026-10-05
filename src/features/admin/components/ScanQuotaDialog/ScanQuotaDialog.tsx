import { useEffect, useState } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Field, Input } from '../../../../components/Form/Form'
import { ModalDialog } from '../../../../components/ModalDialog/ModalDialog'
import { useI18n } from '../../../../i18n/I18nProvider'
import { notifyInfo } from '../../../../lib/httpNotice'
import { fetchAdminScanDetail, postAdminScans } from '../../../../mock/liveApi'
import { useStore } from '../../../../mock/store'
import type { ScanAdjustment, ScanQuota, User } from '../../../../mock/types'
import { ScanQuotaNote } from '../../../greenhouse/components/ScanQuotaNote/ScanQuotaNote'
import { ErrorText } from '../ModerationDialog/ModerationDialog.styles'
import { History, HistoryRow, Row } from './ScanQuotaDialog.styles'

/**
 * Admin → a member's AI scans (#67): today's use, extra scans for today (+/−), the daily limit
 * (empty = default), and every change with who made it. Needs the API; mock mode says so.
 */
export function ScanQuotaDialog({ user, onClose, onChange }: { user: User; onClose: () => void; onChange?: () => void }) {
  const { t, locale } = useI18n()
  const { plantxEnv } = useStore()
  const mock = plantxEnv === 'mock'
  const [quota, setQuota] = useState<ScanQuota | null>(null)
  const [history, setHistory] = useState<ScanAdjustment[]>([])
  const [extra, setExtra] = useState('1')
  const [limit, setLimit] = useState(user.dailyScanLimit == null ? '' : String(user.dailyScanLimit))
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const name = user.nickname || user.name

  useEffect(() => {
    if (mock) return
    void fetchAdminScanDetail(user.id).then((outcome) => {
      if (!outcome.ok) return setFailed(true)
      setQuota(outcome.data.quota)
      setHistory(outcome.data.history)
    })
  }, [mock, user.id])

  const send = async (body: Parameters<typeof postAdminScans>[1], note: string) => {
    setBusy(true)
    setFailed(false)
    const outcome = await postAdminScans(user.id, body)
    setBusy(false)
    if (!outcome.ok) return setFailed(true)
    setQuota(outcome.data.quota)
    setHistory(outcome.data.history)
    setReason('')
    notifyInfo(note)
    onChange?.()
  }

  const delta = Number(extra)
  const limitValue = limit.trim() === '' ? null : Number(limit)
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(locale === 'he' ? 'he-IL' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' })

  return (
    <ModalDialog
      title={t.scans.title.replace('{name}', name)}
      lead={t.scans.lead}
      onClose={onClose}
      width={520}
      footer={
        <Button type="button" variant="ghost" onClick={onClose}>
          {t.common.close}
        </Button>
      }
    >
      {mock ? (
        <p>{t.scans.needsApi}</p>
      ) : quota ? (
        <ScanQuotaNote quota={quota} />
      ) : failed ? null : (
        <p>{t.common.loading}</p>
      )}
      <Field>
        {t.scans.reason}
        <Input value={reason} maxLength={200} placeholder={t.scans.reasonPlaceholder} onChange={(event) => setReason(event.target.value)} />
      </Field>
      <Row>
        <Field>
          {t.scans.extraToday}
          <Input type="number" inputMode="numeric" min={-100} max={100} value={extra} onChange={(event) => setExtra(event.target.value)} />
        </Field>
        <Button
          type="button"
          variant="growth"
          disabled={mock || busy || !Number.isInteger(delta) || delta === 0}
          onClick={() =>
            void send({ kind: 'extra', delta, reason }, t.scans.extraDone.replace('{n}', (delta > 0 ? '+' : '') + delta).replace('{name}', name))
          }
        >
          {t.scans.give}
        </Button>
      </Row>
      <Row>
        <Field>
          {t.scans.dailyLimit}
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={1000}
            value={limit}
            placeholder={t.scans.defaultLimit}
            onChange={(event) => setLimit(event.target.value)}
          />
        </Field>
        <Button
          type="button"
          variant="secondary"
          disabled={mock || busy || (limitValue !== null && (!Number.isInteger(limitValue) || limitValue < 0))}
          onClick={() =>
            void send(
              { kind: 'limit', limit: limitValue, reason },
              t.scans.limitDone.replace('{n}', limitValue === null ? t.scans.defaultLimit : String(limitValue)).replace('{name}', name),
            )
          }
        >
          {t.scans.setLimit}
        </Button>
      </Row>
      {failed ? <ErrorText role="alert">{t.scans.failed}</ErrorText> : null}
      {history.length > 0 ? (
        <History aria-label={t.scans.history}>
          {history.map((item) => (
            <HistoryRow key={item.id}>
              <strong>
                {item.kind === 'extra'
                  ? t.scans.historyExtra.replace('{n}', (item.delta > 0 ? '+' : '') + item.delta).replace('{day}', item.day)
                  : t.scans.historyLimit.replace('{n}', item.value == null ? t.scans.defaultLimit : String(item.value))}
              </strong>
              <span>
                {item.createdByName ?? '—'} · {fmt(item.createdAt)}
                {item.reason ? ` · ${item.reason}` : ''}
              </span>
            </HistoryRow>
          ))}
        </History>
      ) : null}
    </ModalDialog>
  )
}
