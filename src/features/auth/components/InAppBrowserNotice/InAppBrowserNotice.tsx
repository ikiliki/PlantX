import { useState } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import { openInBrowserLinks } from '../../../../lib/inAppBrowser'
import { Action, Actions, Card, Quiet } from './InAppBrowserNotice.styles'

/**
 * Shown instead of the Google button inside an app's built-in browser (`inAppBrowser`), where Google sign-in hangs
 * on a white page. Opens this page in Safari or Chrome, or copies the link to paste there.
 */
export function InAppBrowserNotice({ app, url = window.location.href }: { app: string; url?: string }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const links = openInBrowserLinks(url)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      window.prompt(t.auth.inAppCopy, url)
    }
  }

  return (
    <Card role="note" data-in-app-browser>
      <strong>{t.auth.inAppTitle}</strong>
      <p>{app === 'app' ? t.auth.inAppBodyGeneric : t.auth.inAppBody.replace('{app}', app)}</p>
      <Actions>
        {links.safari ? <Action href={links.safari}>{t.auth.inAppSafari}</Action> : null}
        <Action href={links.chrome}>{t.auth.inAppChrome}</Action>
        <Quiet type="button" onClick={() => void copy()}>
          {copied ? t.auth.inAppCopied : t.auth.inAppCopy}
        </Quiet>
      </Actions>
    </Card>
  )
}
