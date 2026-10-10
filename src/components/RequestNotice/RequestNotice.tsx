import { useEffect, useId, useState } from 'react'
import { Button } from '../Button/Button'
import { useI18n } from '../../i18n/I18nProvider'
import { fileLocalIssue } from '../../lib/issueInbox'
import { clampWords, wordCount, type IssueContext } from '../../lib/issueReport'
import {
  dismissHttpNotice,
  sendIssueReport,
  subscribeHttpNotices,
  watchClientErrors,
  type HttpNotice,
} from '../../lib/httpNotice'
import { useStore } from '../../mock/store'
import { careDoneLine } from '../../features/todo/careKinds'
import {
  Actions,
  Card,
  Close,
  Copy,
  Count,
  Failed,
  Form,
  Hint,
  Meta,
  Note,
  Orb,
  Report,
  Stack,
  Title,
} from './RequestNotice.styles'

const DONE_MS = 4000
const FAIL_MS = 8000

/** Error corner. English sits on the right; Hebrew mirrors to the left. Technical details stay off this card. */
export function RequestNoticeStack({
  items,
  onDismiss,
  onReport,
  composing = false,
}: {
  items: readonly HttpNotice[]
  onDismiss: (id: number) => void
  onReport: (note: string, context: IssueContext) => Promise<boolean>
  composing?: boolean
}) {
  const { t } = useI18n()
  const fieldId = useId()
  const [openId, setOpenId] = useState<number | null>(composing ? (items[0]?.id ?? null) : null)
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)

  // Notices close on their own: a success note quickly, an error after a while, but never while its report is open.
  useEffect(() => {
    const timers = items
      .filter((item) => item.id !== openId)
      .map((item) => window.setTimeout(() => onDismiss(item.id), item.tone === 'done' ? DONE_MS : FAIL_MS))
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [items, openId, onDismiss])

  useEffect(() => {
    if (openId != null && !items.some((item) => item.id === openId)) {
      setOpenId(null)
      setNote('')
      setFailed(false)
    }
  }, [items, openId])

  if (items.length === 0) return null

  const openReport = (id: number) => {
    setOpenId(id)
    setNote('')
    setFailed(false)
  }

  const submit = async (item: Extract<HttpNotice, { tone: 'fail' }>) => {
    setSending(true)
    setFailed(false)
    try {
      const ok = await onReport(note, item.context)
      if (!ok) {
        setFailed(true)
        return
      }
      onDismiss(item.id)
    } catch {
      setFailed(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <Stack aria-live="polite">
      {items.map((item) => {
        if (item.tone === 'info') {
          return (
            <Card key={item.id} role="status" $tone="done">
              <Orb aria-hidden $tone="done" />
              <Copy>
                <Title>{item.title}</Title>
                {item.detail ? <Hint>{item.detail}</Hint> : null}
              </Copy>
              <Close type="button" aria-label={t.http.dismiss} onClick={() => onDismiss(item.id)}>
                ×
              </Close>
            </Card>
          )
        }
        if (item.tone === 'done') {
          return (
            <Card key={item.id} role="status" $tone="done">
              <Orb aria-hidden $tone="done" />
              <Copy>
                <Title>
                  {item.care === 'plant'
                    ? t.http.donePlant.replace('{xp}', String(item.xp))
                    : careDoneLine(item.care, t, item.xp)}
                </Title>
              </Copy>
              <Close type="button" aria-label={t.http.dismiss} onClick={() => onDismiss(item.id)}>
                ×
              </Close>
            </Card>
          )
        }
        const open = openId === item.id
        const words = wordCount(note)
        return (
          <Card key={item.id} role="status">
            <Orb aria-hidden />
            <Copy>
              <Title>{t.http.fail}</Title>
              {open ? <Hint>{t.http.reportLead}</Hint> : null}
            </Copy>
            <Close type="button" aria-label={t.http.dismiss} onClick={() => onDismiss(item.id)}>
              ×
            </Close>
            {open ? (
              <Form
                onSubmit={(event) => {
                  event.preventDefault()
                  void submit(item)
                }}
              >
                <Note
                  id={fieldId}
                  value={note}
                  maxLength={2000}
                  placeholder={t.http.notePlaceholder}
                  aria-label={t.http.note}
                  onChange={(event) => setNote(clampWords(event.target.value))}
                />
                <Meta>
                  <Count>
                    {t.http.words.replace('{count}', String(words))}
                  </Count>
                  <Actions>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setOpenId(null)} disabled={sending}>
                      {t.http.cancel}
                    </Button>
                    <Button type="submit" size="sm" variant="growth" disabled={sending}>
                      {sending ? t.http.sending : t.http.send}
                    </Button>
                  </Actions>
                </Meta>
                {failed ? <Failed>{t.http.sendFailed}</Failed> : null}
              </Form>
            ) : (
              <Report type="button" onClick={() => openReport(item.id)}>
                {t.http.report}
              </Report>
            )}
          </Card>
        )
      })}
    </Stack>
  )
}

export function RequestNotice() {
  const { plantxEnv, currentUser } = useStore()
  const [items, setItems] = useState<readonly HttpNotice[]>([])

  useEffect(() => subscribeHttpNotices(setItems), [])
  useEffect(() => {
    watchClientErrors()
  }, [])

  const onReport = async (note: string, context: IssueContext) => {
    if (plantxEnv === 'mock') {
      fileLocalIssue({
        note,
        context,
        userId: currentUser?.id ?? null,
        userName: currentUser?.name ?? null,
      })
      return true
    }
    return sendIssueReport(note, context)
  }

  return <RequestNoticeStack items={items} onDismiss={dismissHttpNotice} onReport={onReport} />
}
