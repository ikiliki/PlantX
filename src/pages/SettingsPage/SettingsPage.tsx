import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../app/AppShell/AppShell.styles'
import { Avatar } from '../../components/Avatar/Avatar'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { canChooseLocale } from '../../i18n/locales'
import { useI18n } from '../../i18n/I18nProvider'
import { GreenhousePlace } from '../../features/greenhouse/components/GreenhousePlace/GreenhousePlace'
import { publicGrowerName } from '../../features/profile/avatarIcons'
import { useStore } from '../../mock/store'
import { theme } from '../../theme/tokens'

export function SettingsPage() {
  const { currentUser, loginAs, setLocale, db } = useStore()
  const { t, locale } = useI18n()
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader>
        <h1>{t.settings.title}</h1>
      </PageHeader>

      <Card style={{ marginBottom: 16 }}>
        {currentUser ? (
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <Avatar name={publicGrowerName(currentUser, locale === 'he')} color={currentUser.avatarColor} icon={currentUser.avatarIcon} size={56} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <strong>{publicGrowerName(currentUser, locale === 'he')}</strong>
              <div style={{ color: theme.colors.muted, fontSize: 14 }}>
                {t.settings.role}: {t.roles[currentUser.role]}
              </div>
              <GreenhousePlace />
            </div>
          </div>
        ) : (
          <p>{t.common.guestBlocked}</p>
        )}
      </Card>

      {canChooseLocale() && (
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            variant={db.locale === 'he' ? 'primary' : 'ghost'}
            onClick={() => setLocale('he')}
          >
            עברית
          </Button>
          <Button
            variant={db.locale === 'en' ? 'primary' : 'ghost'}
            onClick={() => setLocale('en')}
          >
            English
          </Button>
        </div>
      </Card>
      )}

      <Button
        variant="secondary"
        onClick={() => {
          loginAs(null)
          navigate('/login')
        }}
      >
        {t.settings.logout}
      </Button>
    </div>
  )
}
