import { useI18n } from '../../../../i18n/I18nProvider'
import { Note } from './ApiDown.styles'

/** A list the API did not return. `detail` is the reason, when we have one. */
export function ApiDown({ detail }: { detail?: string }) {
  const { t } = useI18n()
  return (
    <Note role="status">
      <strong>{t.admin.serverUnavailable}</strong>
      <span>{detail || t.admin.serverSliceUnavailable}</span>
    </Note>
  )
}
