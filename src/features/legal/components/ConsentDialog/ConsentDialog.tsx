import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from '../../../../components/Button/Button'
import { ModalDialog } from '../../../../components/ModalDialog/ModalDialog'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { PRIVACY_PATH, TERMS_PATH } from '../../legalPaths'
import { needsConsent } from '../../legalVersion'
import { ErrorText, Links } from './ConsentDialog.styles'

/** The ask itself: links to both texts, Agree or Sign out. Nothing else in the app works until one is chosen. */
export function ConsentPrompt({ onAgree, onSignOut }: { onAgree: () => Promise<boolean>; onSignOut: () => void }) {
  const { t } = useI18n()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const agree = async () => {
    setBusy(true)
    setFailed(false)
    const ok = await onAgree()
    setBusy(false)
    if (!ok) setFailed(true)
  }

  return (
    <ModalDialog
      title={t.legal.consentTitle}
      lead={t.legal.consentBody}
      onClose={() => undefined}
      dismissible={false}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onSignOut} disabled={busy}>
            {t.legal.consentSignOut}
          </Button>
          <Button type="button" variant="growth" onClick={() => void agree()} disabled={busy} data-consent-agree>
            {busy ? t.common.loading : t.legal.consentAgree}
          </Button>
        </>
      }
    >
      <Links>
        <a href={TERMS_PATH} target="_blank" rel="noreferrer">
          {t.legal.terms}
        </a>
        <a href={PRIVACY_PATH} target="_blank" rel="noreferrer">
          {t.legal.privacy}
        </a>
      </Links>
      {failed ? <ErrorText role="alert">{t.legal.consentFailed}</ErrorText> : null}
    </ModalDialog>
  )
}

/**
 * A signed-in member who has not agreed to the current Terms (an older version, or a member from before
 * consent existed) is asked once. The legal pages themselves stay readable behind it.
 */
export function ConsentDialog() {
  const { currentUser, acceptTerms, loginAs } = useStore()
  const { pathname } = useLocation()
  if (!needsConsent(currentUser) || pathname === PRIVACY_PATH || pathname === TERMS_PATH) return null
  return <ConsentPrompt onAgree={acceptTerms} onSignOut={() => loginAs(null)} />
}
