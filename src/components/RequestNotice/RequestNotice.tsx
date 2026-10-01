import { useEffect, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { dismissHttpNotice, subscribeHttpNotices, type HttpNotice } from '../../lib/httpNotice'
import { Card, Close, Copy, Orb, Path, Stack, Title } from './RequestNotice.styles'

/** Bottom corner for 200 and 500. English sits on the right; Hebrew mirrors to the left. */
export function RequestNoticeStack({
  items,
  onDismiss,
}: {
  items: readonly HttpNotice[]
  onDismiss: (id: number) => void
}) {
  const { t } = useI18n()
  if (items.length === 0) return null
  return (
    <Stack aria-live="polite">
      {items.map((item) => (
        <Card key={item.id} $tone={item.tone} role="status">
          <Orb aria-hidden $tone={item.tone} />
          <Copy>
            <Title>{item.status}</Title>
            <Path dir="ltr">
              {item.method} {item.path}
            </Path>
          </Copy>
          <Close type="button" aria-label={t.http.dismiss} onClick={() => onDismiss(item.id)}>
            ×
          </Close>
        </Card>
      ))}
    </Stack>
  )
}

export function RequestNotice() {
  const [items, setItems] = useState<readonly HttpNotice[]>([])
  useEffect(() => subscribeHttpNotices(setItems), [])
  return <RequestNoticeStack items={items} onDismiss={dismissHttpNotice} />
}
