import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../../../components/Avatar/Avatar'
import { Icon } from '../../../../components/Icon/Icon'
import { Segmented } from '../../../../components/Segmented/Segmented'
import { ThemeToggle } from '../../../../components/ThemeToggle/ThemeToggle'
import { canChooseLocale } from '../../../../i18n/locales'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { isOperator } from '../../../../theme/operator'
import { useGarden } from '../../../../theme/themeMode'
import { MyScanAllowance } from '../../../greenhouse/components/ScanQuotaNote/ScanQuotaNote'
import { PRIVACY_PATH, TERMS_PATH } from '../../../legal/legalPaths'
import { publicGrowerName } from '../../avatarIcons'
import {
  Chevron,
  Email,
  Head,
  Legal,
  Name,
  Panel,
  Row,
  RowLabel,
  RowLink,
  Rule,
  Scans,
  Who,
} from './AccountMenu.styles'

/**
 * The avatar's dropdown: who you are, then Profile, Settings, AI scans left today, the sunny / night garden
 * toggle, Admin (operators only) and Sign out, with Privacy · Terms at the foot. Profile and Settings open
 * `AccountDialog`. Escape, a tap outside and a route change close it.
 */
export function AccountMenu({
  onClose,
  onProfile,
  onSettings,
}: {
  onClose: () => void
  onProfile: () => void
  onSettings: () => void
}) {
  const { t, locale } = useI18n()
  const { currentUser, loginAs, setLocale } = useStore()
  const navigate = useNavigate()
  const garden = useGarden()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    // The avatar toggles the menu itself; any other tap outside closes it.
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Element | null
      if (panelRef.current?.contains(target) || target?.closest('[data-account-trigger]')) return
      onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [onClose])

  if (!currentUser) return null
  const shown = publicGrowerName(currentUser, locale === 'he')

  const signOut = () => {
    onClose()
    loginAs(null)
    navigate('/login')
  }

  return (
    <Panel ref={panelRef} role="dialog" aria-label={t.profile.cardTitle} data-account-menu>
      <Head>
        <Avatar name={shown} color={currentUser.avatarColor} icon={currentUser.avatarIcon} size={40} />
        <Who>
          <Name>{shown}</Name>
          {currentUser.email ? <Email>{currentUser.email}</Email> : null}
        </Who>
      </Head>
      <Rule />

      <Row type="button" onClick={onProfile} data-account-profile>
        <Icon name="friends" size={18} />
        <RowLabel>{t.settings.profile}</RowLabel>
        <Chevron aria-hidden>›</Chevron>
      </Row>
      <Row type="button" onClick={onSettings} data-account-settings>
        <Icon name="admin" size={18} />
        <RowLabel>{t.nav.settings}</RowLabel>
        <Chevron aria-hidden>›</Chevron>
      </Row>

      <Scans>
        <MyScanAllowance />
      </Scans>

      <Row as="div" data-account-theme>
        <Icon name={garden === 'night' ? 'moon' : 'sun'} size={18} />
        <RowLabel>{garden === 'night' ? t.settings.dark : t.settings.light}</RowLabel>
        <ThemeToggle toNight={t.nav.toNight} toDay={t.nav.toDay} />
      </Row>

      {canChooseLocale() ? (
        <Row as="div">
          <Icon name="globe" size={18} />
          <RowLabel>{t.nav.language}</RowLabel>
          <Segmented<'he' | 'en'>
            ariaLabel={t.nav.language}
            value={locale}
            onChange={setLocale}
            options={[
              { id: 'he', label: t.landing.langHe },
              { id: 'en', label: t.landing.langEn },
            ]}
          />
        </Row>
      ) : null}

      {isOperator(currentUser) ? (
        <RowLink to="/admin/server" onClick={onClose}>
          <Icon name="chart" size={18} />
          <RowLabel>{t.admin.title}</RowLabel>
          <Chevron aria-hidden>›</Chevron>
        </RowLink>
      ) : null}

      <Rule />
      <Row type="button" onClick={signOut} data-account-signout>
        <Icon name="arrowUp" size={18} />
        <RowLabel>{t.profile.signOut}</RowLabel>
      </Row>
      <Legal>
        <a href={PRIVACY_PATH} target="_blank" rel="noreferrer">
          {t.legal.privacy}
        </a>
        {' · '}
        <a href={TERMS_PATH} target="_blank" rel="noreferrer">
          {t.legal.terms}
        </a>
      </Legal>
    </Panel>
  )
}
