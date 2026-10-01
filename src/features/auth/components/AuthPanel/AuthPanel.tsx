import { FormEvent, useEffect, useRef, useState } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import { fetchGoogleAuth } from '../../../../mock/liveApi'
import { useStore } from '../../../../mock/store'
import { clientEnv } from '../../../../theme/plantxEnv'
import type { AuthReason } from '../../AuthProvider'
import {
  Brand,
  BrandMark,
  BrandName,
  BrandTagline,
  ErrorText,
  Foot,
  Form,
  GoogleSlot,
  Hint,
  Input,
  Lead,
  Options,
  Panel,
  Remember,
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

export function AuthPanel({
  reason = 'buy',
  start,
  dialog = false,
  gate = false,
  ssoOnly = false,
  embedded = false,
  titleId = 'auth-dialog-title',
  onSuccess,
  onContinue,
}: {
  reason?: AuthReason
  start?: 'login' | 'register'
  showDemo?: boolean
  /** Compact card for popup / overlay. */
  dialog?: boolean
  /** Same card as login; primary CTA only (e.g. go to /login). */
  gate?: boolean
  /** Google button only. No email, password, or register. */
  ssoOnly?: boolean
  /** Google control only, for the shared public hold card. */
  embedded?: boolean
  titleId?: string
  onSuccess: () => void
  onGuest?: () => void
  onContinue?: () => void
}) {
  const { t, locale } = useI18n()
  const { loginByEmail, loginWithGoogle, loginWithMockSso, requestAccess } = useStore()
  const [mode, setMode] = useState<'login' | 'register'>(start ?? (reason === 'sell' ? 'register' : 'login'))
  const [loginStep, setLoginStep] = useState<'sso' | 'manual'>('sso')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState(false)
  const [googleClientId, setGoogleClientId] = useState<string | null>(() => envGoogleClientId())
  const googleRef = useRef<HTMLDivElement>(null)

  const googleReady = Boolean(googleClientId)
  const mockSso = ssoOnly && clientEnv() === 'mock'
  const showSso = mockSso
    ? !pending
    : ssoOnly
      ? googleReady && !pending
      : !gate && mode === 'login' && !pending && googleReady && loginStep === 'sso'
  const showManualLogin =
    !ssoOnly && !gate && mode === 'login' && !pending && (!googleReady || loginStep === 'manual')
  const googleLocale = locale === 'he' ? 'he' : 'en'

  const heading = ssoOnly
    ? t.admin.title
    : gate
      ? t.auth.login
      : pending
        ? t.auth.pendingTitle
        : mode === 'register'
          ? t.auth.register
          : t.auth.login
  const copy = ssoOnly
    ? t.admin.operatorOnly
    : gate
      ? ''
      : pending
        ? t.auth.pendingBody
        : mode === 'register'
          ? reasonBody(reason, t)
          : ''

  useEffect(() => {
    if (clientEnv() === 'mock') return
    void fetchGoogleAuth().then((res) => {
      if (res?.enabled && res.clientId) setGoogleClientId(res.clientId)
      else if (!envGoogleClientId()) setGoogleClientId(null)
    })
  }, [])

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
    if (mockSso || !showSso || !googleClientId) return
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
              const result = await loginWithGoogle(response.credential)
              setBusy(false)
              if (!result.ok) {
                setError(
                  result.reason === 'unknown'
                    ? t.auth.googleUnknown
                    : result.reason === 'offline'
                      ? t.auth.offline
                      : t.auth.googleFailed,
                )
                return
              }
              onSuccess()
            })()
          },
          cancel_on_tap_outside: true,
        })
        window.google.accounts.id.renderButton(googleRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: 280,
          locale: googleLocale,
        })
      } catch {
        if (!cancelled) {
          setGoogleClientId(null)
          if (!ssoOnly) setLoginStep('manual')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [mockSso, showSso, googleClientId, googleLocale, loginWithGoogle, onSuccess, ssoOnly, t.auth.googleFailed])

  const onLogin = async (event: FormEvent) => {
    event.preventDefault()
    if (!password.trim()) {
      setError(t.auth.invalid)
      return
    }
    setBusy(true)
    setError('')
    const ok = await loginByEmail(email)
    setBusy(false)
    if (!ok) {
      setError(t.auth.invalid)
      return
    }
    onSuccess()
  }

  const onRegister = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !email.includes('@') || !password.trim()) {
      setError(t.auth.invalid)
      return
    }
    setBusy(true)
    setError('')
    const result = await requestAccess({ name, email })
    setBusy(false)
    if (!result.ok) {
      setError(
        result.reason === 'exists'
          ? t.auth.exists
          : result.reason === 'offline'
            ? t.auth.offline
            : t.auth.invalid,
      )
      return
    }
    setPending(true)
  }

  const switchMode = (next: 'login' | 'register') => {
    setMode(next)
    setError('')
    setPending(false)
    setLoginStep(googleReady ? 'sso' : 'manual')
  }

  if (embedded) {
    if (mockSso) {
      return (
        <>
          <Submit type="button" onClick={() => void onMockSso()} disabled={busy}>
            {busy ? t.common.loading : t.auth.google}
          </Submit>
          {error && <ErrorText>{error}</ErrorText>}
        </>
      )
    }
    return showSso ? (
      <>
        <GoogleSlot ref={googleRef} aria-label={t.auth.google} />
        {error && <ErrorText>{error}</ErrorText>}
      </>
    ) : (
      <ErrorText>{t.auth.googleFailed}</ErrorText>
    )
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
          <Title id={titleId} $compact={dialog}>
            {heading}
          </Title>
          {copy ? <Lead $compact={dialog}>{copy}</Lead> : null}

          {gate ? (
            <Submit type="button" onClick={() => onContinue?.()}>
              {t.profile.lockedAction}
            </Submit>
          ) : pending ? (
            <Foot>
              <TextButton type="button" onClick={() => switchMode('login')}>
                {t.auth.switchToLogin}
              </TextButton>
            </Foot>
          ) : showSso ? (
            <>
              {mockSso ? (
                <Submit type="button" onClick={() => void onMockSso()} disabled={busy}>
                  {busy ? t.common.loading : t.auth.google}
                </Submit>
              ) : (
                <GoogleSlot ref={googleRef} aria-label={t.auth.google} />
              )}
              {error && <ErrorText>{error}</ErrorText>}
              {!ssoOnly && (
                <Foot>
                  <TextButton
                    type="button"
                    onClick={() => {
                      setError('')
                      setLoginStep('manual')
                    }}
                  >
                    {t.auth.useEmail}
                  </TextButton>
                  <TextButton type="button" onClick={() => switchMode('register')}>
                    {t.auth.switchToRegister}
                  </TextButton>
                </Foot>
              )}
            </>
          ) : ssoOnly ? (
            <ErrorText>{t.auth.googleFailed}</ErrorText>
          ) : showManualLogin ? (
            <>
              <Form onSubmit={(event) => void onLogin(event)}>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder={t.auth.email}
                  aria-label={t.auth.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder={t.auth.password}
                  aria-label={t.auth.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Options>
                  <Remember>
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    {t.auth.remember}
                  </Remember>
                </Options>
                <Hint>{t.auth.passwordHint}</Hint>
                {error && <ErrorText>{error}</ErrorText>}
                <Submit type="submit" disabled={busy}>
                  {t.auth.submitLogin}
                </Submit>
              </Form>
              <Foot>
                {googleReady && (
                  <TextButton
                    type="button"
                    onClick={() => {
                      setError('')
                      setLoginStep('sso')
                    }}
                  >
                    {t.auth.useGoogle}
                  </TextButton>
                )}
                <TextButton type="button" onClick={() => switchMode('register')}>
                  {t.auth.switchToRegister}
                </TextButton>
              </Foot>
            </>
          ) : (
            <>
              <Form onSubmit={(event) => void onRegister(event)}>
                <Input
                  autoComplete="name"
                  placeholder={t.auth.name}
                  aria-label={t.auth.name}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder={t.auth.email}
                  aria-label={t.auth.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder={t.auth.password}
                  aria-label={t.auth.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Hint>{t.auth.passwordHint}</Hint>
                {error && <ErrorText>{error}</ErrorText>}
                <Submit type="submit" disabled={busy}>
                  {busy ? t.auth.submitPending : t.auth.submitRegister}
                </Submit>
              </Form>
              <Foot>
                <TextButton type="button" onClick={() => switchMode('login')}>
                  {t.auth.switchToLogin}
                </TextButton>
              </Foot>
            </>
          )}
        </Panel>
      </Stack>
    </Shell>
  )
}
