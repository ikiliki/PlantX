import type { ReactNode } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { Label, Orb, Row, Rows, Shell } from './LoaderShell.styles'

/** Holds tables, system, and any other live view until the API answers. */
export function LoaderShell({
  children,
  busy,
  fill = false,
}: {
  children?: ReactNode
  /** Story override. Otherwise follows the live API. */
  busy?: boolean
  fill?: boolean
}) {
  const { t } = useI18n()
  const { liveStatus } = useStore()
  const waiting = busy ?? liveStatus === 'loading'
  if (!waiting) return <>{children}</>

  return (
    <Shell $fill={fill} role="status" aria-live="polite" aria-busy="true">
      <Orb aria-hidden />
      <Label>{t.common.loading}</Label>
      <Rows aria-hidden>
        <Row $wide />
        <Row />
        <Row $wide />
        <Row />
      </Rows>
    </Shell>
  )
}
