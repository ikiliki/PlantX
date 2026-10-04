import { useEffect, useRef, useState, type DragEvent } from 'react'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useMediaQuery } from '../../../../lib/useMediaQuery'
import { mockIdentify } from '../../../../mock/identifyMock'
import { postIdentify } from '../../../../mock/liveApi'
import { STAGE_LABEL } from '../../../../mock/marketNaming'
import { useStore } from '../../../../mock/store'
import type { Catalog, Diagnosis, IdentifyTried, Locale, PhotoCheck } from '../../../../mock/types'
import { readPhoto, thumbPhoto } from '../../../../lib/readPhoto'
import { catalogName } from '../../../catalog/catalog'
import { MAX_PLANT_PHOTOS, scanActivityText } from '../../identification'
import { noteMockScanSuggestion } from '../../../catalog/useCatalogSuggestions'
import { AiScan, type AiScanFact, type AiScanState } from '../AiScan/AiScan'
import { PhotoCheckSticker } from '../PhotoCheckSticker/PhotoCheckSticker'
import {
  AddSlot,
  Drop,
  DropArt,
  DropCopy,
  Remove,
  Root,
  Slot,
  SlotButton,
  SlotSticker,
  Strip,
  StripHint,
} from './PhotoIdentify.styles'

/** A fast answer still shows the scan long enough to read. */
const MIN_SCAN_MS = 1400

export type PhotoIdentifyPhase =
  | 'held'
  | 'identifying'
  | 'matched'
  | 'notInCatalog'
  | 'failed'
  | 'notPlant'
  | 'noAccess'

/** One photo and its own identify answer. */
export type PhotoScan = {
  id: string
  photo: string
  phase: PhotoIdentifyPhase
  diagnosis?: Diagnosis
  tried?: IdentifyTried[]
  /** Saved Add Plant request. Absent in UI-mock mode and when no request was made. */
  requestId?: string
}

type ScansUpdate = (update: (scans: PhotoScan[]) => PhotoScan[]) => void

function phaseFromDiagnosis(diagnosis: Diagnosis): 'matched' | 'notInCatalog' | 'notPlant' {
  if (!diagnosis.isPlant) return 'notPlant'
  if (!diagnosis.draft.categoryId) return 'notInCatalog'
  return 'matched'
}

function scanState(phase: PhotoIdentifyPhase): AiScanState {
  if (phase === 'held') return 'ready'
  if (phase === 'identifying') return 'scanning'
  if (phase === 'matched') return 'answered'
  return 'unverified'
}

/** A photo that went to the providers (or was refused before it could). */
export function wasScanned(scan: PhotoScan) {
  return scan.phase !== 'noAccess' && scan.phase !== 'held'
}

export function identifyFacts(
  diagnosis: Diagnosis,
  catalog: Catalog,
  locale: Locale,
  t: ReturnType<typeof useI18n>['t'],
): AiScanFact[] {
  const { draft } = diagnosis
  const category = catalog.categories.find((item) => item.id === draft.categoryId)
  const sub = catalog.subcategories.find((item) => item.id === draft.subcategoryId)
  const common = diagnosis.commonNames[0] || diagnosis.label
  // The species step did not answer: the name came from the catalog-fields step, so don't call it the species.
  const speciesFailed = diagnosis.steps?.some((step) => step.id === 'species' && !step.ok) ?? false
  const facts: (AiScanFact | null)[] = [
    common
      ? { id: 'common', label: speciesFailed ? t.addPlant.factName : t.addPlant.factSpecies, value: common }
      : null,
    diagnosis.scientificName && diagnosis.scientificName !== common
      ? { id: 'scientific', label: t.addPlant.factScientific, value: diagnosis.scientificName }
      : null,
    category ? { id: 'category', label: t.admin.category, value: catalogName(category, locale) } : null,
    sub ? { id: 'subcategory', label: t.admin.subcategory, value: catalogName(sub, locale) } : null,
    draft.quality ? { id: 'health', label: t.admin.health, value: draft.quality } : null,
    draft.size ? { id: 'size', label: t.admin.size, value: draft.size } : null,
    draft.stage
      ? { id: 'stage', label: t.admin.stage, value: STAGE_LABEL[draft.stage]?.[locale] ?? draft.stage }
      : null,
  ]
  return facts.filter((item): item is AiScanFact => item !== null)
}

function newScanId() {
  return `scan-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

/**
 * Photo step of Add Plant. `max` is how many photos can be added; each one is sent to the identify chain.
 * The parent owns the scans; `checks` (same order) stamps each thumbnail against the class being saved.
 */
export function PhotoIdentify({
  scans,
  onScansChange,
  checks = [],
  max = MAX_PLANT_PHOTOS,
  analyze = true,
  showAnswer = true,
}: {
  scans: PhotoScan[]
  onScansChange: ScansUpdate
  checks?: PhotoCheck[]
  max?: number
  /** When false, a new photo is kept and not sent until this becomes true. */
  analyze?: boolean
  /** The answer panel belongs on the review step. The photo step keeps the photo. */
  showAnswer?: boolean
}) {
  const { t, locale } = useI18n()
  const { db, currentUser, signedIn, liveWritable, plantxEnv, noteActivity } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const started = useRef(new Set<string>())
  const [selectedId, setSelectedId] = useState<string>()
  const [dragging, setDragging] = useState(false)
  // A phone can't drop a file: it takes a photo or picks one from the gallery.
  const touch = useMediaQuery('(pointer: coarse)')

  const selected = scans.find((scan) => scan.id === selectedId) ?? scans[scans.length - 1]
  const room = Math.max(0, max - scans.length)

  const patch = (id: string, next: Partial<PhotoScan>) =>
    onScansChange((current) => current.map((scan) => (scan.id === id ? { ...scan, ...next } : scan)))

  const runIdentify = async (id: string, dataUrl: string) => {
    const uiMock = plantxEnv === 'mock'
    if (!signedIn || (!liveWritable && !uiMock)) {
      patch(id, { phase: 'noAccess' })
      return
    }
    const started = Date.now()
    const result = uiMock
      ? { ok: true as const, diagnosis: await mockIdentify(db.catalog), record: undefined, activity: undefined }
      : await postIdentify(dataUrl, await thumbPhoto(dataUrl))
    const wait = MIN_SCAN_MS - (Date.now() - started)
    if (wait > 0) await new Promise((resolve) => window.setTimeout(resolve, wait))

    if (result.activity) noteActivity(result.activity)
    else if (uiMock && currentUser) {
      noteActivity({
        id: `up-scan-${id}`,
        kind: 'scan',
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
        ...scanActivityText(result.ok ? result.diagnosis : undefined),
      })
    }

    if (!result.ok) {
      patch(id, { phase: 'failed', tried: result.tried, requestId: result.record?.id })
      return
    }
    // The server files a not-in-catalog scan as the member's suggestion; mock mode does it here.
    if (uiMock && currentUser && db.catalog) noteMockScanSuggestion(result.diagnosis, currentUser.id, db.catalog)
    patch(id, {
      phase: phaseFromDiagnosis(result.diagnosis),
      diagnosis: result.diagnosis,
      tried: result.diagnosis.tried,
      requestId: result.record?.id,
    })
  }

  const begin = (id: string, dataUrl: string) => {
    if (started.current.has(id)) return
    started.current.add(id)
    patch(id, { phase: 'identifying' })
    void runIdentify(id, dataUrl)
  }

  useEffect(() => {
    if (!analyze) return
    for (const scan of scans) {
      if (scan.phase === 'held') begin(scan.id, scan.photo)
    }
    // begin closes over the latest identify call; scans and analyze are the triggers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyze, scans])

  const onFiles = (files: FileList | null | undefined) => {
    const picked = [...(files ?? [])].filter((file) => file.type.startsWith('image/')).slice(0, room)
    for (const file of picked) {
      const id = newScanId()
      void readPhoto(file).then((dataUrl) => {
        onScansChange((current) =>
          current.length >= max
            ? current
            : [...current, { id, photo: dataUrl, phase: analyze ? 'identifying' : 'held' }],
        )
        setSelectedId(id)
        if (analyze) begin(id, dataUrl)
      })
    }
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    onFiles(event.dataTransfer.files)
  }

  const dragProps = {
    onDragOver: (event: DragEvent) => {
      event.preventDefault()
      setDragging(true)
    },
    onDragLeave: () => setDragging(false),
    onDrop,
  }

  const remove = (id: string) => {
    onScansChange((current) => current.filter((scan) => scan.id !== id))
    if (id === selectedId) setSelectedId(undefined)
  }

  const input = (
    <input
      ref={fileRef}
      type="file"
      accept="image/*"
      multiple={max > 1}
      hidden
      onChange={(event) => {
        onFiles(event.target.files)
        event.target.value = ''
      }}
    />
  )

  if (!selected) {
    return (
      <Root>
        {input}
        <Drop type="button" $dragging={dragging} onClick={() => fileRef.current?.click()} {...dragProps}>
          <DropArt aria-hidden>
            <span>✦</span>
          </DropArt>
          <DropCopy>
            <strong>
              {max > 1
                ? t.addPlant.dropTitle.replace('{max}', String(max))
                : touch
                  ? t.addPlant.dropTitleTouch
                  : t.addPlant.dropTitleOne}
            </strong>
            <small>
              {max > 1 ? t.addPlant.dropHint.replace('{max}', String(max)) : touch ? t.addPlant.dropHintTouch : t.addPlant.dropHintOne}
            </small>
          </DropCopy>
        </Drop>
      </Root>
    )
  }

  const notice = (() => {
    switch (selected.phase) {
      case 'notInCatalog':
        return {
          title: t.addPlant.notInCatalogTitle,
          body: t.addPlant.notInCatalogBody.replace('{label}', selected.diagnosis?.label ?? ''),
        }
      case 'notPlant':
        return { title: t.addPlant.notPlantTitle, body: t.addPlant.notPlantBody }
      case 'noAccess':
        return { title: t.addPlant.noAccessTitle, body: t.addPlant.noAccessBody }
      default:
        return { title: t.addPlant.failedTitle, body: t.addPlant.failedBody }
    }
  })()

  const answered = selected.phase === 'matched' || selected.phase === 'notInCatalog'
  const photoOnly = !showAnswer && answered

  return (
    <Root>
      {input}
      <AiScan
        key={selected.id}
        photo={selected.photo}
        state={photoOnly ? 'ready' : scanState(selected.phase)}
        quiet={photoOnly}
        facts={
          !photoOnly && selected.phase === 'matched' && selected.diagnosis
            ? identifyFacts(selected.diagnosis, db.catalog, locale, t)
            : []
        }
        provider={selected.diagnosis?.provider}
        probability={selected.diagnosis?.probability}
        mode={selected.diagnosis?.mode}
        tried={selected.tried ?? []}
        notice={notice}
        onRemove={max <= 1 ? () => remove(selected.id) : undefined}
        removeLabel={t.addPlant.removePhoto.replace('{n}', '1')}
      />
      {max > 1 && (
      <>
      <Strip aria-label={t.addPlant.photoStrip.replace('{n}', String(scans.length)).replace('{max}', String(max))}>
        {scans.map((scan, index) => {
          const label = t.addPlant.stickerPhoto.replace('{n}', String(index + 1))
          return (
            <Slot key={scan.id} $on={scan.id === selected.id}>
              <SlotButton type="button" aria-pressed={scan.id === selected.id} aria-label={label} onClick={() => setSelectedId(scan.id)}>
                <PlantImage src={scan.photo} alt="" />
              </SlotButton>
              <SlotSticker>
                <PhotoCheckSticker scanning={scan.phase === 'identifying'} check={checks[index]} />
              </SlotSticker>
              <Remove
                type="button"
                aria-label={t.addPlant.removePhoto.replace('{n}', String(index + 1))}
                onClick={() => remove(scan.id)}
              >
                ×
              </Remove>
            </Slot>
          )
        })}
        {room > 0 ? (
          <AddSlot type="button" $dragging={dragging} onClick={() => fileRef.current?.click()} {...dragProps}>
            <span aria-hidden>+</span>
            <strong>{t.addPlant.addPhoto}</strong>
            <small>
              {scans.length}/{max}
            </small>
          </AddSlot>
        ) : null}
      </Strip>
      <StripHint>
        {room > 0
          ? t.addPlant.morePhotosHint
          : t.addPlant.maxPhotosHint.replace('{max}', String(max))}
      </StripHint>
      </>
      )}
    </Root>
  )
}
