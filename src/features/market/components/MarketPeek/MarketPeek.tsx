import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { PlantCatalogMark } from '../../../greenhouse/components/CatalogMark/CatalogMark'
import { wikiHref } from '../../../species/components/GuideLink/GuideLink'
import { speciesPhoto } from '../../../species/speciesPhoto'
import { listedQuantity, listingsForClass, lotPhotos, stageLabelFor } from '../../classLots'
import { speciesName } from '../../categoryData'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import {
  Backdrop,
  Card,
  Change,
  Close,
  Code,
  Copy,
  Fact,
  Name,
  NameLine,
  PeekGallery,
  PeekMore,
  PeekShot,
  Photo,
  Price,
  PriceRow,
  Sheet,
  Stat,
  Stats,
  Top,
  WikiButton,
} from './MarketPeek.styles'
import { useDialogLayer } from '../../../../lib/dialogLayer'

export function MarketPeekCard({
  classId,
  speciesId,
  plantId,
  variant = 'hover',
  masked = false,
}: {
  classId?: string
  speciesId?: string
  plantId?: string
  variant?: 'hover' | 'dialog'
  masked?: boolean
}) {
  const { db } = useStore()
  const { t, locale, formatMoney } = useI18n()
  const mc = classId ? db.marketClasses.find((item) => item.id === classId) : undefined
  const plant = plantId ? db.plants.find((item) => item.id === plantId) : undefined
  const species = db.species.find((item) => item.id === (speciesId ?? plant?.speciesId ?? mc?.speciesId))
  if (!mc && !species && !plant) return null

  const name = plant
    ? locale === 'he'
      ? plant.titleHe
      : plant.title
    : mc
      ? locale === 'he'
        ? mc.displayNameHe
        : mc.displayName
      : species
        ? speciesName(species, locale)
        : ''
  const photo = plant?.photos[0] ?? mc?.photo ?? (species ? speciesPhoto(db, species.id) : undefined)
  const wikiTo = species ? wikiHref(species.id) : undefined
  const stage = mc ? stageLabelFor(t.market, mc.stage) : undefined
  const dialog = variant === 'dialog'
  const nameEl = <Name id={dialog && !masked ? 'market-peek-title' : undefined}>{name}</Name>
  const nameLine = plant ? (
    <NameLine>
      <PlantCatalogMark plant={plant} size={24} />
      {nameEl}
    </NameLine>
  ) : (
    nameEl
  )

  if (masked) {
    const facts = [mc?.quality, mc?.size, stage].filter(Boolean).join(' · ')
    return (
      <Card>
        <Top>
          <Photo>
            <PlantImage src={photo} alt="" />
          </Photo>
          <Copy>
            {species && <Code>{speciesName(species, locale)}</Code>}
            {nameLine}
            {facts && <Fact>{facts}</Fact>}
          </Copy>
        </Top>
        {wikiTo && <WikiButton to={wikiTo}>{t.guide.wiki}</WikiButton>}
      </Card>
    )
  }

  const price = mc?.lastPrice ?? 0
  const supply = mc?.supplyUnits ?? 0
  const value = price * Math.max(supply, 1)
  const listings = classId ? listingsForClass(db, classId) : []
  const photos = classId ? lotPhotos(db, classId, photo) : photo ? [photo] : []
  const shown = photos.slice(0, 4)
  const extra = photos.length - shown.length
  const listed = listedQuantity(listings)

  return (
    <Card $dialog={dialog}>
      {dialog && shown.length > 0 && (
        <PeekGallery $count={shown.length}>
          {shown.map((src, index) => (
            <PeekShot key={src} $hero={index === 0 && shown.length === 3}>
              <PlantImage src={src} alt="" />
              {index === shown.length - 1 && extra > 0 && <PeekMore>+{extra}</PeekMore>}
            </PeekShot>
          ))}
        </PeekGallery>
      )}
      <Top $bare={dialog}>
        {!dialog && (
          <Photo>
            <PlantImage src={photo} alt="" />
          </Photo>
        )}
        <Copy>
          {mc && <Code>{mc.code}</Code>}
          {nameLine}
        </Copy>
      </Top>
      {mc && (
        <>
          <PriceRow>
            <Price>{formatMoney(mc.lastPrice)}</Price>
            <Change $up={mc.changePct >= 0}>
              {mc.changePct >= 0 ? '▲' : '▼'} {Math.abs(mc.changePct).toFixed(1)}%
            </Change>
          </PriceRow>
          <Stats>
            <Stat>
              <dt>{t.exchange.portfolio}</dt>
              <dd>{formatMoney(value)}</dd>
            </Stat>
            <Stat>
              <dt>{t.exchange.supply}</dt>
              <dd>{mc.supplyUnits.toLocaleString()}</dd>
            </Stat>
            {dialog && (
              <>
                <Stat>
                  <dt>{t.market.forSale}</dt>
                  <dd>×{listed || mc.askQty}</dd>
                </Stat>
                <Stat>
                  <dt>{t.market.size}</dt>
                  <dd>
                    {mc.quality} · {mc.size} · {stage}
                  </dd>
                </Stat>
              </>
            )}
          </Stats>
        </>
      )}
      {wikiTo && <WikiButton to={wikiTo}>{t.guide.wiki}</WikiButton>}
    </Card>
  )
}

export function MarketPeekDialog({
  classId,
  speciesId,
  onClose,
}: {
  classId?: string
  speciesId?: string
  onClose: () => void
}) {
  const { t } = useI18n()
  const sheetRef = useRef<HTMLDivElement>(null)

  // A layer: the page behind stays put, and back closes it.
  useDialogLayer(onClose)
  useEffect(() => {
    sheetRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return createPortal(
    <Backdrop onClick={onClose}>
      <Sheet
        ref={sheetRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="market-peek-title"
        onClick={(event) => event.stopPropagation()}
      >
        <Close type="button" onClick={onClose} aria-label={t.common.cancel}>
          ×
        </Close>
        <MarketPeekCard classId={classId} speciesId={speciesId} variant="dialog" />
      </Sheet>
    </Backdrop>,
    document.body,
  )
}
