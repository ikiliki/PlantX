import { useId, useState, type FormEvent } from 'react'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { LEGAL_VERSION } from '../../../legal/legalVersion'
import { ErrorText, Submit } from '../AuthPanel/AuthPanel.styles'
import { Field, Form, Hint, Input } from './PasswordForm.styles'

const PASSWORD_MIN = 8

/**
 * PP: email + password, checked by the server against its Supabase Auth. `register` adds a name and creates the
 * account. The Terms box lives in `AuthPanel`; the button waits for it, as Google's does.
 */
export function PasswordForm({
  mode,
  agreed,
  onSuccess,
  onPending,
}: {
  mode: 'login' | 'register'
  agreed: boolean
  onSuccess: () => void
  onPending: () => void
}) {
  const { t } = useI18n()
  const { loginWithPassword } = useStore()
  const id = useId()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const register = mode === 'register'

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy || !agreed) return
    setBusy(true)
    setError('')
    const result = await loginWithPassword(mode, {
      email: email.trim(),
      password,
      name: register ? name.trim() : undefined,
      termsVersion: LEGAL_VERSION,
    })
    setBusy(false)
    if (result.ok) {
      onSuccess()
      return
    }
    if (result.reason === 'pending') {
      onPending()
      return
    }
    setError(
      result.reason === 'auth' && !register
        ? t.auth.wrongPassword
        : result.reason === 'exists'
          ? t.auth.emailTaken
          : result.reason === 'rate_limited'
            ? t.auth.tooMany
            : result.reason === 'declined'
              ? t.auth.declined
              : result.reason === 'offline'
                ? t.auth.offline
                : result.message || t.auth.signInFailed,
    )
  }

  return (
    <Form onSubmit={(event) => void onSubmit(event)} data-password-form={mode}>
      {register && (
        <Field htmlFor={`${id}-name`}>
          {t.auth.name}
          <Input
            id={`${id}-name`}
            name="name"
            autoComplete="name"
            maxLength={60}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
      )}
      <Field htmlFor={`${id}-email`}>
        {t.auth.email}
        <Input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          dir="ltr"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>
      <Field htmlFor={`${id}-password`}>
        {t.auth.password}
        <Input
          id={`${id}-password`}
          name="password"
          type="password"
          autoComplete={register ? 'new-password' : 'current-password'}
          dir="ltr"
          required
          minLength={register ? PASSWORD_MIN : undefined}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {register && <Hint>{t.auth.passwordHint.replace('{n}', String(PASSWORD_MIN))}</Hint>}
      </Field>
      {error && <ErrorText role="alert">{error}</ErrorText>}
      <Submit type="submit" disabled={busy || !agreed} title={agreed ? undefined : t.legal.agreeFirst}>
        {busy ? t.common.loading : register ? t.auth.createAccount : t.auth.login}
      </Submit>
    </Form>
  )
}
