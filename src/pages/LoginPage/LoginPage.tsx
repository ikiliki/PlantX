import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Avatar } from '../../components/Avatar/Avatar'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { theme } from '../../theme/tokens'
import { PageHeader } from '../../app/AppShell/AppShell.styles'

const Grid = styled.div`
  display: grid;
  gap: ${theme.space.md};
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
`

const Persona = styled(Card)`
  display: grid;
  gap: 12px;
`

const Top = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`

export function LoginPage() {
  const { db, loginAs } = useStore()
  const { t, locale, tr } = useI18n()
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader>
        <div>
          <h1>{t.login.title}</h1>
          <p>{t.login.subtitle}</p>
        </div>
      </PageHeader>
      <Grid>
        {db.users
          .filter((u) => u.role !== 'guest')
          .map((u) => (
            <Persona key={u.id}>
              <Top>
                <Avatar name={u.name} color={u.avatarColor} size={52} />
                <div>
                  <strong>{locale === 'he' ? u.nameHe : u.name}</strong>
                  <div style={{ color: theme.colors.muted, fontSize: 13 }}>
                    {t.roles[u.role]}
                    {u.businessName &&
                      ` · ${locale === 'he' ? u.businessNameHe : u.businessName}`}
                  </div>
                </div>
              </Top>
              <p style={{ color: theme.colors.muted, fontSize: 14 }}>
                {tr(u.bio, u.bioHe)}
              </p>
              <Button
                block
                onClick={() => {
                  loginAs(u.id)
                  navigate('/')
                }}
              >
                {t.login.enter}
              </Button>
            </Persona>
          ))}
      </Grid>
      <div style={{ marginTop: 24 }}>
        <Button
          variant="ghost"
          onClick={() => {
            loginAs('u-guest')
            navigate('/')
          }}
        >
          {t.login.continueGuest}
        </Button>
        {' · '}
        <Link to="/claim" style={{ fontWeight: 700, color: theme.colors.greenDark }}>
          {t.claim.title}
        </Link>
      </div>
    </div>
  )
}
