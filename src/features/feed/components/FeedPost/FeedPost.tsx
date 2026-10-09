import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Avatar } from '../../../../components/Avatar/Avatar'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { SkeletonBar } from '../../../../components/Skeleton/Skeleton'
import { useI18n } from '../../../../i18n/I18nProvider'
import { personaScenarioId } from '../../../../mock/personas'
import { useStore } from '../../../../mock/store'
import type { FeedUpdate } from '../../../../mock/types'
import { clientEnv } from '../../../../theme/plantxEnv'
import { VerifiedStamp } from '../../../greenhouse/components/VerifiedStamp/VerifiedStamp'
import { publicGrowerName } from '../../../profile/avatarIcons'
import { activityKindLabel } from '../../activityMoment'
import { formatFeedTime } from '../../formatFeedTime'
import { useMediaQuery } from '../../../../lib/useMediaQuery'
import { ActivityMoment, MomentGlyph } from '../ActivityMoment/ActivityMoment'
import { CommentSheet } from '../CommentSheet/CommentSheet'
import { CommentThread } from '../CommentThread/CommentThread'
import { ReactBar } from '../ReactBar/ReactBar'
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
  PhotoSkeleton,
  PlantTitle,
  ProfileButton,
  Social,
  Who,
} from './FeedPost.styles'

/** The same post with shimmer bars: loading for a member, and the blurred page behind a guest's log-in card. */
export function FeedPostSkeleton() {
  return (
    <Card aria-hidden>
      <Head>
        <SkeletonBar width="36px" height={36} round />
        <Who>
          <SkeletonBar width="110px" height={12} />
          <SkeletonBar width="80px" height={10} />
        </Who>
        <SkeletonBar width="48px" height={18} />
      </Head>
      <PhotoSkeleton />
      <Foot>
        <SkeletonBar width="55%" height={16} />
        <SkeletonBar width="85%" height={12} />
      </Foot>
    </Card>
  )
}

/**
 * One activity on the Feed tab: the grower, a big photo of the plant, its name and the activity line, and a
 * link to the passport. The photo opens the same moment dialog as Home's compact `FeedUpdate`.
 */
export function FeedPost({ update }: { update: FeedUpdate }) {
  const { t, tr, locale } = useI18n()
  const { db, currentUser } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  // Wide: the comments open under the post. A phone gets a bottom sheet.
  const wide = useMediaQuery('(min-width: 900px)')
  const user = db.users.find((item) => item.id === update.userId && item.role !== 'guest')
  const plant = update.plantId ? db.plants.find((item) => item.id === update.plantId) : undefined
  const name = user ? publicGrowerName(user, locale === 'he') : ''
  // Your own posts say so: "Full Name (you)".
  const mine = Boolean(currentUser && currentUser.id === update.userId)
  const youMark = mine ? ` ${t.feed.youMark}` : ''
  const growerLabel = (clientEnv() === 'mock' ? t.demo.personaScenarios[personaScenarioId(update.userId)] : name) + youMark
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
              {verified ? t.greenhouse.verifiedGreenhouse + youMark : growerLabel}
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
        <Social>
          <ReactBar update={update} commentsOpen={commentsOpen} onComments={() => setCommentsOpen((value) => !value)} />
          {commentsOpen && wide ? <CommentThread update={update} /> : null}
        </Social>
      </Card>
      {open ? <ActivityMoment update={update} onClose={() => setOpen(false)} /> : null}
      {commentsOpen && !wide ? <CommentSheet update={update} onClose={() => setCommentsOpen(false)} /> : null}
    </>
  )
}
