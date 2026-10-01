import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../../../components/Avatar/Avatar'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import {
  AvatarButton,
  AvatarRing,
  Bio,
  Foot,
  Identity,
  Label,
  Missing,
  Name,
  NameBlock,
  NameButton,
  Role,
  Root,
  Specialties,
  SpecialtyBlock,
  Stat,
  Stats,
} from './ProfileSummary.styles'

export function ProfileSummary({
  userId,
  titleId,
  compact = false,
}: {
  userId: string
  titleId?: string
  /** Tighter padding for dialog / seller overlay. */
  compact?: boolean
}) {
  const { db, currentUser } = useStore()
  const { t, tr, locale } = useI18n()
  const navigate = useNavigate()
  const user = db.users.find((item) => item.id === userId && item.role !== 'guest')
  if (!user) return <Missing id={titleId}>{t.seller.notFound}</Missing>

  const name = tr(user.name, user.nameHe)
  const business = locale === 'he' ? user.businessNameHe : user.businessName
  const specialties = locale === 'he' ? user.specialtiesHe : user.specialties
  const isSelf = currentUser?.id === user.id

  const openFull = () => {
    if (isSelf) {
      navigate('/profile')
      return
    }
    navigate(`/sellers/${user.id}`, { state: { sellerFull: true } })
  }

  return (
    <Root $compact={compact} aria-label={name}>
      <Identity>
        <AvatarRing>
          {compact ? (
            <AvatarButton type="button" onClick={openFull} aria-label={name}>
              <Avatar name={user.name} color={user.avatarColor} size={76} />
            </AvatarButton>
          ) : (
            <Avatar name={user.name} color={user.avatarColor} size={76} />
          )}
        </AvatarRing>
        <NameBlock>
          {compact ? (
            <Name id={titleId}>
              <NameButton type="button" onClick={openFull}>
                {name}
              </NameButton>
            </Name>
          ) : (
            <Name id={titleId}>{name}</Name>
          )}
          <Role>
            {[t.roles[user.role], business, tr(user.region, user.regionHe)].filter(Boolean).join(' · ')}
          </Role>
          <Bio>{tr(user.bio, user.bioHe)}</Bio>
        </NameBlock>
      </Identity>

      <div />

      <Foot>
        <Stats>
          <Stat>
            <dt>{t.seller.rating}</dt>
            <dd>★ {user.rating}</dd>
          </Stat>
          <Stat>
            <dt>{t.seller.orders}</dt>
            <dd>{user.completedOrders}</dd>
          </Stat>
          <Stat>
            <dt>{t.seller.verification}</dt>
            <dd>{Math.round(user.verificationRate * 100)}%</dd>
          </Stat>
          <Stat>
            <dt>{t.seller.cancellations}</dt>
            <dd>{user.cancellations}</dd>
          </Stat>
        </Stats>
        {specialties.length > 0 && (
          <SpecialtyBlock>
            <Label>{t.seller.specialties}</Label>
            <Specialties>
              {specialties.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </Specialties>
          </SpecialtyBlock>
        )}
      </Foot>
    </Root>
  )
}
