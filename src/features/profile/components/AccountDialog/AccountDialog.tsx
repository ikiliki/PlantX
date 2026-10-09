import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../../../components/Avatar/Avatar'
import { Button } from '../../../../components/Button/Button'
import { Input } from '../../../../components/Form/Form'
import { FilterChips } from '../../../../components/FilterChips/FilterChips'
import { Icon } from '../../../../components/Icon/Icon'
import { greenhouseLevel } from '../../../greenhouse/greenhouseLevel'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { isOperator } from '../../../../theme/operator'
import { GreenhousePlace } from '../../../greenhouse/components/GreenhousePlace/GreenhousePlace'
import { MyScanAllowance } from '../../../greenhouse/components/ScanQuotaNote/ScanQuotaNote'
import { PRIVACY_PATH, TERMS_PATH } from '../../../legal/legalPaths'
import { AppearanceSettings } from '../AppearanceSettings/AppearanceSettings'
import { DeleteAccountDialog } from '../DeleteAccountDialog/DeleteAccountDialog'
import {
  AVATAR_ICONS,
  avatarIconId,
  avatarUnlocked,
  cleanNickname,
  publicGrowerName,
  type AvatarIconId,
} from '../../avatarIcons'
import {
  Backdrop,
  Block,
  Card,
  Close,
  DangerLink,
  Face,
  FieldLabel,
  Footer,
  GuestTitle,
  FooterLink,
  HiddenTitle,
  Hint,
  IconChoice,
  IconRow,
  Label,
  LabelRow,
  LegalRow,
  Mark,
  Rows,
  Tabs,
  Value,
} from './AccountDialog.styles'

const TITLE_ID = 'account-dialog-title'

type SettingsTab = 'profile' | 'appearance' | 'account'

function Privacy({ kind, label }: { kind: 'public' | 'private'; label: string }) {
  return (
    <Mark $kind={kind}>
      <Icon name={kind === 'public' ? 'globe' : 'lock'} size={13} />
      {label}
    </Mark>
  )
}

/**
 * Signed-in account card, and the only settings surface (there is no Settings page): nickname, icon and
 * greenhouse place (public), account name and email (private), AI scans left, language, sign out, the
 * Privacy / Terms links and Delete my account (not for the admin).
 * Open it from anywhere with `?account=1` (`accountHref`); the top bar owns it.
 */
export function AccountDialog({ onClose }: { onClose: () => void }) {
  const { currentUser, db, loginAs, setAccount, deleteAccount } = useStore()
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const [nickname, setNickname] = useState(currentUser?.nickname ?? '')
  const [status, setStatus] = useState<'idle' | 'saved' | 'failed'>('idle')
  const [deleting, setDeleting] = useState(false)
  const [tab, setTab] = useState<SettingsTab>('profile')

  useEffect(() => {
    setNickname(currentUser?.nickname ?? '')
  }, [currentUser?.id, currentUser?.nickname])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  // A guest has no account yet: the same card holds only Appearance (the top bar gear opens it).
  if (!currentUser || currentUser.role === 'guest') {
    return createPortal(
      <Backdrop onClick={onClose}>
        <Card
          role="dialog"
          aria-modal="true"
          aria-labelledby={TITLE_ID}
          onClick={(event) => event.stopPropagation()}
          data-settings-dialog
        >
          <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
            ×
          </Close>
          <GuestTitle id={TITLE_ID}>{t.nav.settings}</GuestTitle>
          <AppearanceSettings />
        </Card>
      </Backdrop>,
      document.body,
    )
  }

  const name = locale === 'he' ? currentUser.nameHe : currentUser.name
  const shown = publicGrowerName(currentUser, locale === 'he')
  const level = greenhouseLevel(currentUser.id, db.plants, db.todos).level
  const icon = avatarIconId(currentUser.avatarIcon)
  const nicknameDirty = cleanNickname(nickname) !== cleanNickname(currentUser.nickname ?? '')

  const saveNickname = async () => {
    const next = cleanNickname(nickname)
    setNickname(next)
    if (next === cleanNickname(currentUser.nickname ?? '')) return
    const ok = await setAccount({ nickname: next })
    setStatus(ok ? 'saved' : 'failed')
  }

  const chooseIcon = async (id: AvatarIconId) => {
    if (!avatarUnlocked(id, level) || id === icon) return
    const ok = await setAccount({ avatarIcon: id })
    setStatus(ok ? 'saved' : 'failed')
  }

  const removeAccount = async () => {
    const ok = await deleteAccount()
    if (!ok) return false
    setDeleting(false)
    onClose()
    navigate('/login')
    return true
  }

  const signOut = () => {
    onClose()
    loginAs(null)
    navigate('/login')
  }

  return createPortal(
    <Backdrop onClick={onClose}>
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        onClick={(event) => event.stopPropagation()}
      >
        <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
          ×
        </Close>
        <Face>
          <Avatar name={shown} color={currentUser.avatarColor} icon={icon} size={72} />
          <HiddenTitle id={TITLE_ID}>{t.profile.cardTitle}</HiddenTitle>
          <Privacy kind="public" label={t.profile.publicMark} />
        </Face>
        <Tabs>
          <FilterChips<SettingsTab>
            label={t.settings.tabs}
            value={tab}
            onChange={setTab}
            options={[
              { id: 'profile', label: t.settings.profile },
              { id: 'appearance', label: t.settings.appearance },
              { id: 'account', label: t.settings.account },
            ]}
          />
        </Tabs>

        {tab === 'appearance' ? <AppearanceSettings /> : null}

        {tab === 'profile' ? (
        <Rows>
          <Block>
            <LabelRow>
              <Label>{t.profile.nameLabel}</Label>
              <Privacy kind="private" label={t.profile.privateMark} />
            </LabelRow>
            <Value>{name}</Value>
          </Block>

          <Block>
            <LabelRow>
              <Label>{t.profile.emailLabel}</Label>
              <Privacy kind="private" label={t.profile.privateMark} />
            </LabelRow>
            <Value>{currentUser.email || '—'}</Value>
          </Block>

          <Block>
            <LabelRow>
              <FieldLabel htmlFor="account-nickname">{t.profile.nicknameLabel}</FieldLabel>
              <Privacy kind="public" label={t.profile.publicMark} />
            </LabelRow>
            <Input
              id="account-nickname"
              value={nickname}
              maxLength={32}
              autoComplete="off"
              placeholder={t.profile.nicknamePlaceholder}
              onChange={(event) => {
                setStatus('idle')
                setNickname(event.target.value)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && nicknameDirty) void saveNickname()
              }}
            />
            {nicknameDirty && (
              <Button type="button" variant="growth" onClick={() => void saveNickname()}>
                {t.common.save}
              </Button>
            )}
            <Hint $tone={status === 'saved' ? 'ok' : status === 'failed' ? 'bad' : undefined}>
              {status === 'saved'
                ? t.profile.nicknameSaved
                : status === 'failed'
                  ? t.profile.nicknameFailed
                  : t.profile.nicknameHint}
            </Hint>
          </Block>

          <Block>
            <LabelRow>
              <Label>{t.profile.iconLabel}</Label>
              <Privacy kind="public" label={t.profile.publicMark} />
            </LabelRow>
            <IconRow>
              {AVATAR_ICONS.map((item) => {
                const open = avatarUnlocked(item.id, level)
                const on = item.id === icon
                return (
                  <IconChoice
                    key={item.id}
                    type="button"
                    $on={on}
                    disabled={!open}
                    aria-pressed={on}
                    aria-label={t.profile.iconSeed}
                    onClick={() => void chooseIcon(item.id)}
                  >
                    <Avatar name={shown} color={currentUser.avatarColor} icon={item.id} size={40} />
                  </IconChoice>
                )
              })}
            </IconRow>
            <Hint>{t.profile.iconHint}</Hint>
          </Block>

          <Block>
            <LabelRow>
              <FieldLabel htmlFor="account-place">{t.profile.placeLabel}</FieldLabel>
              <Privacy kind="public" label={t.profile.publicMark} />
            </LabelRow>
            <GreenhousePlace id="account-place" />
          </Block>
        </Rows>
        ) : null}

        {tab === 'account' ? (
        <Footer>
          <MyScanAllowance />
          {isOperator(currentUser) && (
            <FooterLink to="/admin/server" onClick={onClose}>
              {t.admin.title}
            </FooterLink>
          )}
          <Button type="button" variant="secondary" block onClick={signOut}>
            {t.profile.signOut}
          </Button>
          <LegalRow>
            <span>
              <a href={PRIVACY_PATH} target="_blank" rel="noreferrer">
                {t.legal.privacy}
              </a>
              {' · '}
              <a href={TERMS_PATH} target="_blank" rel="noreferrer">
                {t.legal.terms}
              </a>
            </span>
            {currentUser.role !== 'admin' && (
              <DangerLink type="button" onClick={() => setDeleting(true)} data-delete-account>
                {t.legal.deleteAccount}
              </DangerLink>
            )}
          </LegalRow>
        </Footer>
        ) : null}
        {deleting && (
          <DeleteAccountDialog
            plants={db.plants.filter((plant) => plant.ownerId === currentUser.id).length}
            onDelete={removeAccount}
            onClose={() => setDeleting(false)}
          />
        )}
      </Card>
    </Backdrop>,
    document.body,
  )
}

/** Query flag the top bar reads to open the account dialog (there is no Settings page). */
export const ACCOUNT_PARAM = 'account'

/** A link that opens the account dialog over `pathname` (default: the greenhouse). */
export function accountHref(pathname = '/greenhouse') {
  return `${pathname}?${ACCOUNT_PARAM}=1`
}
