import { useState } from 'react'
import { HoldStage } from '../../../../components/HoldStage/HoldStage'
import { HoldNotice } from '../../../../components/HoldNotice/HoldNotice'
import { AuthPanel } from '../../../auth/components/AuthPanel/AuthPanel'
import { useI18n } from '../../../../i18n/I18nProvider'
import { Choice, Chooser, Frame } from './RedirectPreview.styles'

const MODES = ['not-launched', 'maintenance', 'admin'] as const
type RedirectMode = (typeof MODES)[number]

/** The public hold pages, inside the admin system window. */
export function RedirectPreview() {
  const { t } = useI18n()
  const [mode, setMode] = useState<RedirectMode>('not-launched')

  const labels: Record<RedirectMode, string> = {
    'not-launched': t.release.notLaunched,
    maintenance: t.release.maintenance,
    admin: t.admin.title,
  }

  return (
    <>
      <Chooser role="group" aria-label={t.admin.systemRedirects}>
        {MODES.map((id) => (
          <Choice key={id} type="button" $on={mode === id} aria-pressed={mode === id} onClick={() => setMode(id)}>
            {labels[id]}
          </Choice>
        ))}
      </Chooser>
      <Frame>
        {mode === 'admin' ? (
          <HoldStage preview mode="admin" mark={t.admin.title} title={t.auth.google} body={t.admin.operatorOnly}>
            <AuthPanel embedded ssoOnly titleId="admin-preview-sso" onSuccess={() => undefined} />
          </HoldStage>
        ) : (
          <HoldNotice mode={mode} preview />
        )}
      </Frame>
    </>
  )
}
