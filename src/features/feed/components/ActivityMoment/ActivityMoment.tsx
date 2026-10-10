import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import type { FeedUpdate, FeedUpdateKind, Plant } from '../../../../mock/types'
import { PassportDialog } from '../../../greenhouse/components/PassportDialog/PassportDialog'
import { GreenhousePlantCard } from '../../../greenhouse/components/GreenhousePlantCard/GreenhousePlantCard'
import { PhotoChecks } from '../../../greenhouse/components/PhotoChecks/PhotoChecks'
import { SheetGrip, useSheetDrag } from '../../../../components/SheetGrip/SheetGrip'
import { formatFeedTime } from '../../formatFeedTime'
import { activityKindLabel, opensPassport } from '../../activityMoment'
import {
  Backdrop,
  Checks,
  Close,
  Copy,
  Dialog,
  Drop,
  Eyebrow,
  Flash,
  Glyph,
  KindMark,
  Leaf,
  Note,
  PlantSlot,
  Play,
  PriceTag,
  Ring,
  Scroll,
  Spark,
  SplitLeaf,
  Sprout,
  Stamp,
  Stem,
  When,
} from './ActivityMoment.styles'
import { useDialogLayer } from '../../../../lib/dialogLayer'

/** Corner motion for a feed or activity row. The row sets `data-moment` so hover can play with it. */
export function MomentPlay({ kind }: { kind: FeedUpdateKind }) {
  return (
    <Play aria-hidden>
      {kind === 'water' ? (
        <>
          <Ring />
          <Ring $delay="0.8s" />
          <Ring $delay="1.6s" />
          <Drop />
        </>
      ) : null}
      {kind === 'added' ? (
        <Sprout>
          <Stem />
          <Leaf />
          <Leaf $side="right" />
        </Sprout>
      ) : null}
      {kind === 'photo' ? <Flash /> : null}
      {kind === 'propagate' ? (
        <>
          <SplitLeaf />
          <SplitLeaf $side="right" />
        </>
      ) : null}
      {kind === 'grade' ? (
        <>
          <Spark />
          <Spark $i={1} />
          <Spark $i={2} />
        </>
      ) : null}
      {kind === 'listing' ? <PriceTag /> : null}
      {kind === 'passport' ? <Stamp>✓</Stamp> : null}
    </Play>
  )
}

export function MomentGlyph({ kind }: { kind: FeedUpdateKind }) {
  return <Glyph $kind={kind} aria-hidden />
}

export function ActivityKindMark({ kind, children }: { kind: FeedUpdateKind; children: ReactNode }) {
  return (
    <KindMark $kind={kind} data-moment={kind}>
      <MomentGlyph kind={kind} />
      {children}
    </KindMark>
  )
}

function scanned(update: FeedUpdate, plant?: Plant) {
  if (!plant || update.kind !== 'scan') return null
  const checks = plant.identification?.photos ?? []
  const photos = plant.photos.filter(Boolean)
  const hit = checks.find((check) => check.requestId === update.identifyRequestId)
  if (!hit) return null
  return { photos: [photos[hit.position] ?? ''], checks: [{ ...hit, position: 0 }] }
}

function MomentSheet({
  update,
  plant,
  onClose,
}: {
  update: FeedUpdate
  plant?: Plant
  onClose: () => void
}) {
  const { t, tr, locale } = useI18n()
  const photos = scanned(update, plant)
  const sheet = useSheetDrag(onClose)

  // A layer: the page behind stays put, and back closes it.
  useDialogLayer(onClose)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const label = activityKindLabel(update.kind, t.feed)

  return createPortal(
    <Backdrop onClick={onClose}>
      <Dialog
        ref={sheet.bind}
        $kind={update.kind}
        data-moment={update.kind}
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-moment-title"
        onClick={(event) => event.stopPropagation()}
      >
        <SheetGrip label={t.common.dragToClose} {...sheet.grip} />
        <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
          ×
        </Close>
        <Scroll>
          <Copy>
            <Eyebrow>
              <MomentGlyph kind={update.kind} />
              <span>{label}</span>
            </Eyebrow>
            <Note id="activity-moment-title">{tr(update.body, update.bodyHe)}</Note>
            <When dateTime={update.createdAt}>{formatFeedTime(update.createdAt, locale, t.feed)}</When>
          </Copy>
          {photos ? (
            <Checks>
              <PhotoChecks photos={photos.photos} checks={photos.checks} />
            </Checks>
          ) : null}
          {plant ? (
            <PlantSlot>
              <GreenhousePlantCard plant={plant} preview />
            </PlantSlot>
          ) : null}
        </Scroll>
      </Dialog>
    </Backdrop>,
    document.body,
  )
}

/** Clicking a feed, activity, or admin row opens this. New plants and grades open the passport. */
export function ActivityMoment({ update, onClose }: { update: FeedUpdate; onClose: () => void }) {
  const { db } = useStore()
  const plant = update.plantId ? db.plants.find((item) => item.id === update.plantId) : undefined
  if (opensPassport(update.kind) && plant) {
    return <PassportDialog plantId={plant.id} activityKey={update.id} onClose={onClose} />
  }
  return <MomentSheet update={update} plant={plant} onClose={onClose} />
}
