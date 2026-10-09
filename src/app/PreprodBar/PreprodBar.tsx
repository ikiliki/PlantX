import { useEffect, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { fetchPasswordAuth } from '../../mock/liveApi'
import { useStore } from '../../mock/store'
import { clientEnv } from '../../theme/plantxEnv'
import { Badge, Dock } from './PreprodBar.styles'

/**
 * PP only (Vercel previews): a small "PP · <who>" badge so a tester knows where they are and as whom.
 * Signing in and switching users go through the normal login (email + password on PP).
 */
export function PreprodBar() {
  const { t } = useI18n()
  const { currentUser } = useStore()
  const [preprod, setPreprod] = useState(false)

  useEffect(() => {
    if (clientEnv() === 'mock') return
    let live = true
    void fetchPasswordAuth().then((res) => {
      if (live) setPreprod(Boolean(res?.preprod))
    })
    return () => {
      live = false
    }
  }, [])

  if (!preprod) return null
  const who = currentUser ? currentUser.name : t.preprod.guest

  return (
    <Dock>
      <Badge role="status" title={t.preprod.signedInAs.replace('{name}', who)} data-preprod-badge>
        {t.preprod.label} · {who}
      </Badge>
    </Dock>
  )
}
