import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { PhotoCheck } from '../../../../mock/types'
import { PhotoCheckSticker } from '../PhotoCheckSticker/PhotoCheckSticker'
import {
  Gallery,
  PhotoFrame,
  PhotoSticker,
  Thumb,
  Thumbs,
  ViewerBackdrop,
  ViewerCard,
  ViewerClose,
  ViewerStage,
  ViewerStrip,
  ViewerThumb,
} from './PlantPhotoGallery.styles'

type PlantPhotoGalleryProps = {
  photos: string[]
  /** Per-photo AI checks; the shown photo carries its sticker. */
  checks?: PhotoCheck[]
  alt: string
  embedded?: boolean
  dialog?: boolean
  index: number
  onIndexChange: (index: number) => void
  viewerOpen: boolean
  onViewerOpenChange: (open: boolean) => void
}

function checkAt(checks: PhotoCheck[] | undefined, position: number) {
  return checks?.find((check) => check.position === position)
}

function PlantPhotoViewer({
  photos,
  checks,
  alt,
  index,
  onIndexChange,
  onClose,
}: {
  photos: string[]
  checks?: PhotoCheck[]
  alt: string
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
}) {
  const { t } = useI18n()
  const safe = Math.min(index, Math.max(0, photos.length - 1))

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') onIndexChange(Math.min(safe + 1, photos.length - 1))
      if (event.key === 'ArrowLeft') onIndexChange(Math.max(safe - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose, onIndexChange, photos.length, safe])

  return createPortal(
    <ViewerBackdrop onClick={onClose} role="presentation">
      <ViewerCard
        role="dialog"
        aria-modal="true"
        aria-label={t.passport.photos}
        onClick={(event) => event.stopPropagation()}
      >
        <ViewerClose type="button" onClick={onClose} aria-label={t.common.cancel}>
          ×
        </ViewerClose>
        <ViewerStage key={photos[safe]}>
          <PlantImage src={photos[safe]} alt={alt} />
          {checkAt(checks, safe) ? (
            <PhotoSticker>
              <PhotoCheckSticker check={checkAt(checks, safe)} size="md" />
            </PhotoSticker>
          ) : null}
        </ViewerStage>
        {photos.length > 1 && (
          <ViewerStrip role="group" aria-label={t.passport.photos}>
            {photos.map((src, i) => (
              <ViewerThumb
                key={`${src}-${i}`}
                type="button"
                $on={i === safe}
                aria-pressed={i === safe}
                aria-label={t.passport.photo.replace('{n}', String(i + 1))}
                onClick={() => onIndexChange(i)}
              >
                <PlantImage src={src} alt="" />
              </ViewerThumb>
            ))}
          </ViewerStrip>
        )}
      </ViewerCard>
    </ViewerBackdrop>,
    document.body,
  )
}

export function PlantPhotoGallery({
  photos,
  checks,
  alt,
  embedded = false,
  dialog = false,
  index,
  onIndexChange,
  viewerOpen,
  onViewerOpenChange,
}: PlantPhotoGalleryProps) {
  const { t } = useI18n()
  if (photos.length === 0) return null

  const safeIndex = Math.min(index, photos.length - 1)

  const openViewer = (at: number) => {
    onIndexChange(at)
    onViewerOpenChange(true)
  }

  return (
    <>
      <Gallery $embedded={embedded} $dialog={dialog}>
        <PhotoFrame
          type="button"
          $embedded={embedded}
          $dialog={dialog}
          aria-label={t.passport.photos}
          onClick={() => openViewer(safeIndex)}
        >
          <PlantImage src={photos[safeIndex]} alt={alt} />
          {checkAt(checks, safeIndex) ? (
            <PhotoSticker key={safeIndex}>
              <PhotoCheckSticker check={checkAt(checks, safeIndex)} size="md" />
            </PhotoSticker>
          ) : null}
        </PhotoFrame>
        {photos.length > 1 && (
          <Thumbs role="group" aria-label={t.passport.photos}>
            {photos.map((src, i) => (
              <Thumb
                key={`${src}-${i}`}
                type="button"
                $on={i === safeIndex}
                aria-pressed={i === safeIndex}
                aria-label={t.passport.photo.replace('{n}', String(i + 1))}
                onClick={() => onIndexChange(i)}
                onDoubleClick={() => openViewer(i)}
              >
                <PlantImage src={src} alt="" />
              </Thumb>
            ))}
          </Thumbs>
        )}
      </Gallery>
      {viewerOpen && (
        <PlantPhotoViewer
          photos={photos}
          checks={checks}
          alt={alt}
          index={safeIndex}
          onIndexChange={onIndexChange}
          onClose={() => onViewerOpenChange(false)}
        />
      )}
    </>
  )
}
