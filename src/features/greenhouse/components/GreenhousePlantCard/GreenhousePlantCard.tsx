import { useEffect, useId, useRef, useState } from 'react'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { isPlacementEnabled, isPlacementReady } from '../../../../theme/release'
import { isPhotoStale, isWaterDue } from '../../plantCare'
import type { Plant } from '../../../../mock/types'
import { PlantCatalogMark } from '../CatalogMark/CatalogMark'
import {
  Actions,
  AddRoot,
  CollectionGrid,
  Details,
  Menu,
  MenuButton,
  MenuItem,
  MoreWrap,
  Name,
  NameRow,
  PassportMark,
  Photo,
  PhotoLink,
  Plus,
  PrimaryAction,
  Root,
  StatusMark,
} from './GreenhousePlantCard.styles'

export { CollectionGrid }

export function AddPlantCard({ onClick }: { onClick: () => void }) {
  const { t } = useI18n()
  return (
    <AddRoot type="button" onClick={onClick}>
      <Plus aria-hidden>+</Plus>
      <span>{t.greenhouse.addAnother}</span>
    </AddRoot>
  )
}

function statusFor(
  plant: Plant,
  marketOpen: boolean,
  t: ReturnType<typeof useI18n>['t'],
): { label: string; tone: 'warm' | 'fresh' | 'calm' | 'due' } {
  if (isWaterDue(plant)) return { label: t.greenhouse.badgeWaterDue, tone: 'due' }
  if (isPhotoStale(plant)) return { label: t.greenhouse.badgePhotoDue, tone: 'due' }
  if (plant.status === 'listed') {
    return {
      label: marketOpen ? t.greenhouse.cardListed : t.greenhouse.pendingMarket,
      tone: 'fresh',
    }
  }
  return { label: t.greenhouse.badgeGrowing, tone: 'calm' }
}

export function GreenhousePlantCard({
  plant,
  onUpdate,
  onWater,
  onPropagate,
  onSell,
}: {
  plant: Plant
  onUpdate?: () => void
  onWater?: () => void
  onPropagate?: () => void
  onSell?: () => void
}) {
  const { db } = useStore()
  const { t, tr } = useI18n()
  const marketOpen = isPlacementReady(db.system, 'market.board')
  const cardOn = isPlacementEnabled(db.system, 'greenhouse.card')
  const status = statusFor(plant, marketOpen, t)
  const verified = Boolean(plant.verifiedAt)
  const menuId = useId()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const waterDue = isWaterDue(plant)
  const photoDue = isPhotoStale(plant)
  const living = plant.status === 'owned' || plant.status === 'listed'

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!cardOn) return null

  const primary =
    living && waterDue && onWater ? (
      <PrimaryAction type="button" onClick={onWater}>
        {t.greenhouse.waterAction}
      </PrimaryAction>
    ) : living && photoDue && onUpdate ? (
      <PrimaryAction type="button" onClick={onUpdate}>
        {t.greenhouse.refreshAction}
      </PrimaryAction>
    ) : null

  const menu = living && (onSell || onPropagate) ? (
    <MoreWrap ref={wrapRef}>
      <MenuButton
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t.greenhouse.moreActions}
        onClick={() => setOpen((value) => !value)}
      >
        ···
      </MenuButton>
      {open ? (
        <Menu id={menuId} role="menu">
          {onPropagate ? (
            <MenuItem
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onPropagate()
              }}
            >
              {t.greenhouse.actionPropagate}
            </MenuItem>
          ) : null}
          {onSell ? (
            <MenuItem
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onSell()
              }}
            >
              {t.greenhouse.actionSell}
            </MenuItem>
          ) : null}
        </Menu>
      ) : null}
    </MoreWrap>
  ) : null

  return (
    <Root>
      <PhotoLink to={`/plants/${plant.id}`} aria-haspopup="dialog">
        <Photo $stale={photoDue}>
          <PlantImage src={plant.photos[0]} alt="" />
          <StatusMark $tone={status.tone}>{status.label}</StatusMark>
        </Photo>
      </PhotoLink>
      <Details>
        <NameRow>
          <PlantCatalogMark plant={plant} size={24} />
          <Name to={`/plants/${plant.id}`}>{tr(plant.title, plant.titleHe)}</Name>
          {verified ? <PassportMark>✓ {t.greenhouse.passportOk}</PassportMark> : null}
        </NameRow>
        {primary || menu ? (
          <Actions>
            {primary}
            {menu}
          </Actions>
        ) : null}
      </Details>
    </Root>
  )
}
