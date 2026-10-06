import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import { fetchGoogleAuth } from '../../../../mock/liveApi'
import { useStore } from '../../../../mock/store'
import { clientEnv } from '../../../../theme/plantxEnv'
import { track } from '../../../../lib/track'
import { LEGAL_VERSION } from '../../../legal/legalVersion'
import { PRIVACY_PATH, TERMS_PATH } from '../../../legal/legalPaths'
import type { AuthReason } from '../../AuthProvider'
import {
  Brand,
  BrandMark,
  BrandName,
  BrandTagline,
  Consent,
  ErrorText,
  Foot,
  GoogleGate,
  GoogleSlot,
  Lead,
  Panel,
  Pending,
  Shell,
  Stack,
  Submit,
  TextButton,
  Title,
} from './AuthPanel.styles'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string
              size?: string
              shape?: string
              text?: string
              width?: number
              locale?: string
            },
          ) => void
        }
      }
    }
  }
}

function reasonBody(reason: AuthReason, t: ReturnType<typeof useI18n>['t']) {
  if (reason === 'sell') return t.auth.sellBody
  if (reason === 'history') return t.auth.historyBody
  if (reason === 'sensitive') return t.auth.sensitiveBody
  if (reason === 'rank') return t.auth.rankBody
  return ''
}

function loadGisScript(hl: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-plantx-gsi]')
    if (existing) {
      const loadedHl = existing.dataset.plantxGsiHl
      if (window.google?.accounts?.id && loadedHl === hl) {
        resolve()
        return
      }
      // Reload GIS when locale changes so button text matches app language.
      existing.remove()
      delete (window as { google?: unknown }).google
    }
    const script = document.createElement('script')
    script.src = `https://accounts.google.com/gsi/client?hl=${encodeURIComponent(hl)}`
    script.async = true
    script.defer = true
    script.dataset.plantxGsi = 'true'
    script.dataset.plantxGsiHl = hl
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('gsi'))
    document.head.appendChild(script)
  })
}

function envGoogleClientId() {
  const id = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim()
  return id || null
}

/**
 * Google is the only sign-in. Log in and sign up are one flow: a new Google email signs up. While the app is on
 * the account opens and signs in at once; while it is off the card says thanks and the admin pre-approves it.
 * With Google off, the panel says sign-ups are paused and offers the guest path instead of an error.
 */
export function AuthPanel({
  reason = 'buy',
  start,
  dialog = false,
  gate = false,
  titleId = 'auth-dialog-title',
  headingLevel = 'h1',
  onSuccess,
  onContinue,
  onGuest,
}: {
  reason?: AuthReason
  start?: 'login' | 'register'
  /** Compact card for popup / overlay. */
  dialog?: boolean
  /** Same card as login; primary CTA only (e.g. go to /login). */
  gate?: boolean
  titleId?: string
  /** `h2` when the panel sits inside a page that already has its own h1 (the landing). */
  headingLevel?: 'h1' | 'h2'
  onSuccess: () => void
  onContinue?: () => void
  /** Browse without an account: shown when sign-in is paused. */
  onGuest?: () => void
}) {
  const { t, locale } = useI18n()
  const { loginWithGoogle, loginWithMockSso } = useStore()
  const [mode, setMode] = useState<'login' | 'register'>(start ?? (reason === 'sell' ? 'register' : 'login'))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState(false)
  // The first Google sign-in is the sign-up, so every sign-in agrees to the Terms first.
  const [agreed, setAgreed] = useState(false)
  const [googleClientId, setGoogleClientId] = useState<string | null>(() => envGoogleClientId())
  // Until the server says whether Google is on, show neither the button nor "paused".
  // Google is on but its script did not load (blocked or offline): an error, not "paused".
  const [gisFailed, setGisFailed] = useState(false)
  const [checking, setChecking] = useState(() => clientEnv() !== 'mock' && !envGoogleClientId())
  const googleRef = useRef<HTMLDivElement>(null)
  // Callers and the store pass fresh functions each render; read the latest from refs so Google
  // is initialized once per button, not on every render.
  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess
  const loginRef = useRef(loginWithGoogle)
  loginRef.current = loginWithGoogle

  const mockSso = clientEnv() === 'mock'
  const showGoogle = !gate && !pending && !mockSso && Boolean(googleClientId)
  const paused = !gate && !pending && !mockSso && !checking && !googleClientId
  const googleLocale = locale === 'he' ? 'he' : 'en'

  const heading = gate
    ? t.auth.login
    : paused
      ? t.auth.pausedTitle
      : pending
      ? t.auth.pendingTitle
      : mode === 'register'
        ? t.auth.register
        : t.auth.login
  const copy = gate
    ? ''
    : paused
      ? t.auth.pausedBody
      : pending
      ? t.auth.pendingBody
      : mode === 'register'
        ? reasonBody(reason, t) || t.auth.registerBody
        : t.auth.loginBody

  useEffect(() => {
    if (mockSso) return
    void fetchGoogleAuth()
      .then((res) => {
        if (res?.enabled && res.clientId) setGoogleClientId(res.clientId)
        else if (!envGoogleClientId()) setGoogleClientId(null)
      })
      .finally(() => setChecking(false))
  }, [mockSso])

  const onMockSso = async () => {
    setBusy(true)
    setError('')
    const result = await loginWithMockSso()
    setBusy(false)
    if (!result.ok) {
      setError(t.auth.googleFailed)
      return
    }
    onSuccess()
  }

  useEffect(() => {
    if (!showGoogle || !googleClientId) return
    let cancelled = false
    void (async () => {
      try {
        await loadGisScript(googleLocale)
        if (cancelled || !googleRef.current || !window.google) return
        googleRef.current.innerHTML = ''
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            void (async () => {
              setBusy(true)
              setError('')
              const result = await loginRef.current(response.credential, LEGAL_VERSION)
              setBusy(false)
              if (result.ok) {
                onSuccessRef.current()
                return
              }
              if (result.reason === 'pending') {
                setPending(true)
                return
              }
              setError(
                result.reason === 'declined'
                  ? t.auth.declined
                  : result.reason === 'offline'
                    ? t.auth.offline
                    : t.auth.googleFailed,
              )
            })()
          },
          cancel_on_tap_outside: true,
        })
        window.google.accounts.id.renderButton(googleRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: mode === 'register' ? 'signup_with' : 'continue_with',
          width: 280,
          locale: googleLocale,
        })
      } catch {
        if (!cancelled) setGisFailed(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [showGoogle, googleClientId, googleLocale, mode, t.auth])

  const onAgree = (next: boolean) => {
    setAgreed(next)
    if (next) track('signup_start', { mode }, { once: true })
  }

  const switchMode = (next: 'login' | 'register') => {
    setMode(next)
    setError('')
    setPending(false)
  }

  return (
    <Shell $dialog={dialog}>
      <Stack $dialog={dialog}>
        <Brand $compact={dialog}>
          <BrandMark
            $compact={dialog}
            src="/icons/brand-mark.svg"
            alt=""
            width={dialog ? 40 : 56}
            height={dialog ? 40 : 56}
          />
          {!dialog && (
            <>
              <BrandName>PlantX</BrandName>
              <BrandTagline>{t.auth.tagline}</BrandTagline>
            </>
          )}
        </Brand>

        <Panel>
          <Title as={headingLevel} id={titleId} $compact={dialog}>
            {heading}
          </Title>
          {copy ? <Lead $compact={dialog}>{copy}</Lead> : null}

          {gate ? (
            <Submit type="button" onClick={() => onContinue?.()}>
              {t.profile.lockedAction}
            </Submit>
          ) : paused ? (
            onGuest ? (
              <Submit type="button" onClick={onGuest}>
                {t.auth.continueGuest}
              </Submit>
            ) : null
          ) : pending ? (
            <>
              <Pending>{t.auth.pendingHint}</Pending>
              <Foot>
                <TextButton type="button" onClick={() => switchMode('login')}>
                  {t.auth.tryAgain}
                </TextButton>
              </Foot>
            </>
          ) : (
            <>
              {(mockSso || showGoogle) && !gisFailed ? (
                <Consent>
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(event) => onAgree(event.target.checked)}
                    data-terms-agree
                  />
                  <span>
                    {t.legal.agreeBefore}
                    <a href={TERMS_PATH} target="_blank" rel="noreferrer">
                      {t.legal.terms}
                    </a>
                    {t.legal.agreeAnd}
                    <a href={PRIVACY_PATH} target="_blank" rel="noreferrer">
                      {t.legal.privacy}
                    </a>
                    {t.legal.agreeAfter}
                  </span>
                </Consent>
              ) : null}
              {mockSso ? (
                <Submit type="button" onClick={() => void onMockSso()} disabled={busy || !agreed}>
                  {busy ? t.common.loading : t.auth.google}
                </Submit>
              ) : showGoogle && gisFailed ? (
                <ErrorText>{t.auth.googleUnavailable}</ErrorText>
              ) : showGoogle ? (
                <GoogleGate $locked={!agreed} aria-disabled={!agreed || undefined} title={agreed ? undefined : t.legal.agreeFirst}>
                  <GoogleSlot ref={googleRef} aria-label={t.auth.google} aria-busy={busy} />
                </GoogleGate>
              ) : (
                <Pending aria-live="polite">{t.common.loading}</Pending>
              )}
              {error && <ErrorText>{error}</ErrorText>}
              <Foot>
                {mode === 'login' ? (
                  <TextButton type="button" onClick={() => switchMode('register')}>
                    {t.auth.switchToRegister}
                  </TextButton>
                ) : (
                  <TextButton type="button" onClick={() => switchMode('login')}>
                    {t.auth.switchToLogin}
                  </TextButton>
                )}
              </Foot>
            </>
          )}
        </Panel>
      </Stack>
    </Shell>
  )
}
