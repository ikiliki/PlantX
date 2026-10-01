import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { LoaderShell } from '../../../../components/LoaderShell/LoaderShell'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useAuth } from '../../../auth/AuthProvider'
import { AddPlantDialog } from '../../../greenhouse/components/AddPlantDialog/AddPlantDialog'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { useSectionFetch } from '../../../../mock/useServerSlices'
import {
  AddSlot,
  Backdrop,
  Body,
  Card,
  Copy,
  Eyebrow,
  Lure,
  Open,
  Photo,
  Photos,
  PhotoTile,
  Sheet,
  SheetCard,
  SheetClose,
  Title,
} from './GreenhouseLure.styles'

const SLOTS = 3

function LureCopy({ hasPlants }: { hasPlants: boolean }) {
  const { t } = useI18n()
  return (
    <Copy to="/greenhouse">
      <Eyebrow>{t.discover.lureEyebrow}</Eyebrow>
      <Title>{hasPlants ? t.discover.lureYours : t.discover.lureTitle}</Title>
      <Lure>{hasPlants ? t.discover.lureYoursBody : t.discover.lureBody}</Lure>
      <Open>{t.discover.lureOpen}</Open>
    </Copy>
  )
}

export function GreenhouseLure({ compact = false }: { compact?: boolean }) {
  const { db, currentUser, signedIn } = useStore()
  const { openAuth } = useAuth()
  const { t } = useI18n()
  const fetching = useSectionFetch(true, ['plants'])
  const [adding, setAdding] = useState(false)
  const [open, setOpen] = useState(false)
  const ownerId = signedIn && currentUser ? currentUser.id : db.visitorId
  const mine = db.plants.filter((plant) => plant.ownerId === ownerId && plant.photos[0]).slice(0, SLOTS)
  const emptySlots = SLOTS - mine.length
  const hasPlants = mine.length > 0

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const onAdd = () => {
    if (signedIn) setAdding(true)
    else openAuth('buy')
  }

  const photoStack = (mode: 'links' | 'tiles' | 'compact') => (
    <Photos>
      {mine.map((plant, index) =>
        mode === 'links' ? (
          <Photo key={plant.id} to="/greenhouse" $i={index}>
            <PlantImage src={plant.photos[0]} alt="" />
          </Photo>
        ) : (
          <PhotoTile
            key={plant.id}
            type="button"
            $i={index}
            $compact={mode === 'compact'}
            aria-label={t.discover.lureEyebrow}
            aria-haspopup={mode === 'compact' ? 'dialog' : undefined}
            aria-expanded={mode === 'compact' ? open : undefined}
            onClick={() => setOpen(true)}
          >
            <PlantImage src={plant.photos[0]} alt="" />
          </PhotoTile>
        ),
      )}
      {Array.from({ length: emptySlots }, (_, index) => (
        <AddSlot
          key={`add-${index}`}
          type="button"
          $i={mine.length + index}
          $compact={mode === 'compact'}
          aria-label={t.greenhouse.add}
          onClick={(event) => {
            event.stopPropagation()
            onAdd()
          }}
        >
          +
        </AddSlot>
      ))}
    </Photos>
  )

  if (fetching) {
    return (
      <Card $compact={compact}>
        <LoaderShell busy compact />
      </Card>
    )
  }

  if (compact) {
    return (
      <Card $compact>
        {photoStack('compact')}

        {open &&
          createPortal(
            <Backdrop role="presentation" onClick={() => setOpen(false)}>
              <Sheet
                role="dialog"
                aria-modal="true"
                aria-label={t.discover.lureEyebrow}
                onClick={(event) => event.stopPropagation()}
              >
                <SheetClose type="button" aria-label={t.common.cancel} onClick={() => setOpen(false)}>
                  ×
                </SheetClose>
                <SheetCard>
                  <Body>
                    <LureCopy hasPlants={hasPlants} />
                    {photoStack('links')}
                  </Body>
                </SheetCard>
              </Sheet>
            </Backdrop>,
            document.body,
          )}

        {adding && <AddPlantDialog onClose={() => setAdding(false)} />}
      </Card>
    )
  }

  return (
    <Card>
      <Body>
        <LureCopy hasPlants={hasPlants} />
        {photoStack('links')}
      </Body>
      {adding && <AddPlantDialog onClose={() => setAdding(false)} />}
    </Card>
  )
}
