import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Avatar } from '../../../../components/Avatar/Avatar'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { personaScenarioId } from '../../../../mock/personas'
import { useStore } from '../../../../mock/store'
import type { FeedUpdate } from '../../../../mock/types'
import { clientEnv } from '../../../../theme/plantxEnv'
import { VerifiedStamp } from '../../../greenhouse/components/VerifiedStamp/VerifiedStamp'
import { publicGrowerName } from '../../../profile/avatarIcons'
import { activityKindLabel } from '../../activityMoment'
import { formatFeedTime } from '../../formatFeedTime'
import { ActivityMoment, MomentGlyph } from '../ActivityMoment/ActivityMoment'
import { XpChip } from '../XpChip/XpChip'
import {
  Caption,
  Card,
  Foot,
  Grower,
  Head,
  Kind,
  PassportLink,
  Photo,
  PlantTitle,
  ProfileButton,
  Who,
} from './FeedPost.styles'

/**
 * One activity on the Feed tab: the grower, a big photo of the plant, its name and the activity line, and a
 * link to the passport. The photo opens the same moment dialog as Home's compact `FeedUpdate`.
 */
export function FeedPost({ update }: { update: FeedUpdate }) {
  const { t, tr, locale } = useI18n()
  const { db } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const user = db.users.find((item) => item.id === update.userId && item.role !== 'guest')
  const plant = update.plantId ? db.plants.find((item) => item.id === update.plantId) : undefined
  const name = user ? publicGrowerName(user, locale === 'he') : ''
  const growerLabel = clientEnv() === 'mock' ? t.demo.personaScenarios[personaScenarioId(update.userId)] : name
  const verified = Boolean(user && (db.verifiedGreenhouseIds ?? []).includes(user.id))

  const openProfile = () => {
    navigate(
      { pathname: location.pathname, search: location.search, hash: location.hash },
      { state: { profilePreview: update.userId } },
    )
  }

  return (
    <>
      <Card data-feed-post={update.id} data-moment={update.kind}>
        <Head>
          {user ? (
            <ProfileButton type="button" aria-label={name} onClick={openProfile}>
              <Avatar name={name} color={user.avatarColor} icon={user.avatarIcon} size={36} />
            </ProfileButton>
          ) : null}
          <Who>
            <Grower $verified={verified}>
              {verified ? <VerifiedStamp place="inline" /> : null}
              {verified ? t.greenhouse.verifiedGreenhouse : growerLabel}
            </Grower>
            <Kind $kind={update.kind}>
              <MomentGlyph kind={update.kind} />
              {activityKindLabel(update.kind, t.feed)} ·{' '}
              <time dateTime={update.createdAt}>{formatFeedTime(update.createdAt, locale, t.feed)}</time>
            </Kind>
          </Who>
          <XpChip kind={update.kind} />
        </Head>

        {plant?.photos[0] ? (
          <Photo type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={tr(plant.title, plant.titleHe)}>
            <PlantImage src={plant.photos[0]} alt="" loading="lazy" />
          </Photo>
        ) : null}

        <Foot>
          {plant ? <PlantTitle>{tr(plant.title, plant.titleHe)}</PlantTitle> : null}
          <Caption>{tr(update.body, update.bodyHe)}</Caption>
          {plant ? <PassportLink to={`/plants/${plant.id}`}>{t.feedPage.openPassport}</PassportLink> : null}
        </Foot>
      </Card>
      {open ? <ActivityMoment update={update} onClose={() => setOpen(false)} /> : null}
    </>
  )
}
