import { FormEvent, useState } from 'react'
import { Field, Input, TextArea } from '../../../../components/Form/Form'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { Body, Copy, ErrorText, Form, Panel, Submit, Success, Title } from './CommunityRegister.styles'

export function CommunityRegister({ embedded = false }: { embedded?: boolean }) {
  const { t } = useI18n()
  const { requestAccess, signedIn } = useStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (signedIn || busy) return
    if (!name.trim() || !email.includes('@')) {
      setError(t.landing.registerError)
      return
    }
    setBusy(true)
    setError('')
    const result = await requestAccess({ name, email, note: note.trim() || undefined })
    setBusy(false)
    if (!result.ok) {
      setError(
        result.reason === 'exists'
          ? t.landing.registerExists
          : result.reason === 'offline'
            ? t.landing.registerOffline
            : t.landing.registerError,
      )
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <Panel id={embedded ? undefined : 'register'}>
        {embedded ? null : (
          <Copy>
            <Title>{t.landing.registerPendingTitle}</Title>
            <Body>{t.landing.registerPendingBody}</Body>
          </Copy>
        )}
        <Success>{t.landing.registerPendingHint}</Success>
      </Panel>
    )
  }

  return (
    <Panel id={embedded ? undefined : 'register'}>
      {embedded ? null : (
        <Copy>
          <Title>{t.landing.registerTitle}</Title>
          <Body>{t.landing.registerBody}</Body>
        </Copy>
      )}
      <Form onSubmit={(event) => void onSubmit(event)}>
        <Field>
          {t.landing.registerName}
          <Input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
        </Field>
        <Field>
          {t.landing.registerEmail}
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </Field>
        <Field>
          {t.landing.registerNote}
          <TextArea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder={t.landing.registerNoteHint}
          />
        </Field>
        {error && <ErrorText>{error}</ErrorText>}
        <Submit type="submit" disabled={busy || signedIn}>
          {busy ? t.landing.registerSubmitting : t.landing.registerSubmit}
        </Submit>
      </Form>
    </Panel>
  )
}
