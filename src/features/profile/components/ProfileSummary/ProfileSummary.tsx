import { Avatar } from '../../../../components/Avatar/Avatar'
import { useI18n } from '../../../../i18n/I18nProvider'
import { publicGrowerName } from '../../avatarIcons'
import { useStore } from '../../../../mock/store'
import { isPlacementReady } from '../../../../theme/release'
import {
  AvatarRing,
  Bio,
  Foot,
  Identity,
  Label,
  Missing,
  Name,
  NameBlock,
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
  const { db } = useStore()
  const { t, tr, locale } = useI18n()
  const user = db.users.find((item) => item.id === userId && item.role !== 'guest')
  if (!user) return <Missing id={titleId}>{t.seller.notFound}</Missing>

  const name = publicGrowerName(user, locale === 'he')
  const business = locale === 'he' ? user.businessNameHe : user.businessName
  const specialties = locale === 'he' ? user.specialtiesHe : user.specialties
  const showMarketStats = isPlacementReady(db.system, 'profile.market.stats')

  return (
    <Root $compact={compact} aria-label={name}>
      <Identity>
        <AvatarRing>
          <Avatar name={name} color={user.avatarColor} icon={user.avatarIcon} size={76} />
        </AvatarRing>
        <NameBlock>
          <Name id={titleId}>{name}</Name>
          <Role>
            {[t.roles[user.role], business, tr(user.region, user.regionHe)].filter(Boolean).join(' · ')}
          </Role>
          <Bio>{tr(user.bio, user.bioHe)}</Bio>
        </NameBlock>
      </Identity>

      <div />

      <Foot>
        {showMarketStats && (
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
        )}
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
