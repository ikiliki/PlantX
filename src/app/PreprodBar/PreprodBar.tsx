import { useEffect, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import {
  BarLabel,
  Dock,
  Note,
  Panel,
  PanelHead,
  Tab,
  TokenField,
  TokenInput,
  UserButton,
  Users,
} from './PreprodBar.styles'

type TestUser = { id: string; name: string; role: string }

const TOKEN_KEY = 'plantx-pp-token'

function readToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY) ?? ''
  } catch {
    return ''
  }
}

function keepToken(value: string) {
  try {
    window.localStorage.setItem(TOKEN_KEY, value)
  } catch {
    /* private window: the field still works for this page */
  }
}

/**
 * Preprod only (branch preprod/ai-testers). Switch between seeded users in one tab with the test token.
 * Renders nothing unless the server answers /api/session/test-users, which it does only on preprod.
 */
export function PreprodBar() {
  const { t } = useI18n()
  const { currentUser } = useStore()
  const [users, setUsers] = useState<TestUser[] | null>(null)
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState(readToken)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // On load, and again each time the panel opens, so newly approved users show up.
  useEffect(() => {
    let live = true
    fetch('/api/session/test-users', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((body: { users?: TestUser[] } | null) => {
        if (live && body?.users) setUsers(body.users)
      })
      .catch(() => undefined)
    return () => {
      live = false
    }
  }, [open])

  if (!users) return null

  async function switchTo(userId: string | null) {
    if (busy) return
    setBusy(true)
    setError('')
    keepToken(token.trim())
    const res = userId
      ? await fetch('/api/session/test-login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json', 'x-test-token': token.trim() },
          body: JSON.stringify({ userId }),
        }).catch(() => null)
      : await fetch('/api/session', {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ userId: null }),
        }).catch(() => null)
    if (!res?.ok) {
      setBusy(false)
      setError(res?.status === 401 ? t.preprod.badToken : t.preprod.failed)
      return
    }
    // A full load so every slice of the store comes back for the new session.
    window.location.assign('/greenhouse')
  }

  const who = currentUser ? currentUser.name : t.preprod.guest

  return (
    <Dock>
      <Tab type="button" $open={open} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {t.preprod.label} · {who}
      </Tab>
      {open && (
        <Panel role="dialog" aria-label={t.preprod.label}>
          <PanelHead>
            <BarLabel>{t.preprod.signedInAs.replace('{name}', who)}</BarLabel>
          </PanelHead>
          <TokenField>
            {t.preprod.token}
            <TokenInput
              type="password"
              autoComplete="off"
              value={token}
              onChange={(event) => setToken(event.target.value)}
            />
          </TokenField>
          <Users>
            {users.map((user) => (
              <UserButton
                key={user.id}
                type="button"
                disabled={busy}
                $current={currentUser?.id === user.id}
                onClick={() => switchTo(user.id)}
              >
                {user.role === 'admin' ? t.preprod.admin.replace('{name}', user.name) : user.name}
              </UserButton>
            ))}
            <UserButton type="button" disabled={busy} $current={!currentUser} onClick={() => switchTo(null)}>
              {t.preprod.guest}
            </UserButton>
          </Users>
          {busy && <Note role="status">{t.preprod.switching}</Note>}
          {error && <Note role="alert">{error}</Note>}
        </Panel>
      )}
    </Dock>
  )
}
