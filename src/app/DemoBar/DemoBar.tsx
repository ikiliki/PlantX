import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { Button } from '../../components/Button/Button'
import { DemoBarRoot, DemoLabel, DemoSelect } from '../AppShell/AppShell.styles'

const scenarios: { id: string; path: string; userId?: string }[] = [
  { id: 'discover', path: '/', userId: 'u-maya' },
  { id: 'demandCommit', path: '/demand/dm-pothos-1000', userId: 'u-maya' },
  { id: 'passport', path: '/plants/pl-daniel-maple', userId: 'u-daniel' },
  { id: 'handoff', path: '/messages', userId: 'u-maya' },
  { id: 'businessAggregate', path: '/business', userId: 'u-noa' },
  { id: 'eventReuse', path: '/events', userId: 'u-yael' },
  { id: 'adminQueue', path: '/admin', userId: 'u-dana' },
  { id: 'claimDraft', path: '/claim', userId: 'u-guest' },
  { id: 'sellFlow', path: '/sell', userId: 'u-maya' },
  { id: 'financingGate', path: '/future/financing', userId: 'u-daniel' },
  { id: 'stockMarket', path: '/market/mc-pot-gold-a-m-r', userId: 'u-maya' },
]

export function DemoBar() {
  const { db, loginAs, setLocale, resetDemo } = useStore()
  const { t, locale, tr } = useI18n()
  const navigate = useNavigate()

  return (
    <DemoBarRoot>
      <DemoLabel>{t.demo.label}</DemoLabel>
      <span>{t.demo.persona}</span>
      <DemoSelect
        value={db.currentUserId ?? ''}
        onChange={(e) => {
          const id = e.target.value || null
          loginAs(id)
          if (!id) navigate('/login')
        }}
      >
        <option value="">{tr('Not logged in', 'לא מחובר/ת')}</option>
        {db.users.map((u) => (
          <option key={u.id} value={u.id}>
            {locale === 'he' ? u.nameHe : u.name} ({t.roles[u.role]})
          </option>
        ))}
      </DemoSelect>
      <span>{t.demo.language}</span>
      <DemoSelect
        value={locale}
        onChange={(e) => setLocale(e.target.value as 'he' | 'en')}
      >
        <option value="he">עברית</option>
        <option value="en">English</option>
      </DemoSelect>
      <span>{t.demo.scenario}</span>
      <DemoSelect
        defaultValue=""
        onChange={(e) => {
          const s = scenarios.find((x) => x.id === e.target.value)
          if (!s) return
          if (s.userId) loginAs(s.userId)
          navigate(s.path)
          e.target.value = ''
        }}
      >
        <option value="">—</option>
        {scenarios.map((s) => (
          <option key={s.id} value={s.id}>
            {t.demo.scenarios[s.id as keyof typeof t.demo.scenarios]}
          </option>
        ))}
      </DemoSelect>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          resetDemo()
          navigate('/login')
        }}
        style={{ color: 'white', borderColor: 'rgba(255,255,255,0.25)' }}
      >
        {t.demo.reset}
      </Button>
    </DemoBarRoot>
  )
}
