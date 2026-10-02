import { useEffect, useState, type CSSProperties } from 'react'
import { PlantImage } from '../../../../components/PlantImage/PlantImage'
import { useI18n } from '../../../../i18n/I18nProvider'
import type { IdentifyMode, IdentifyProviderId, IdentifyTried } from '../../../../mock/types'
import {
  Attribution,
  Body,
  Caret,
  Corner,
  DemoNote,
  Fact,
  FactLabel,
  FactValue,
  Facts,
  Close,
  Frame,
  Head,
  Layout,
  Node,
  Notice,
  Panel,
  PhotoWell,
  Ring,
  RingValue,
  Root,
  Scanline,
  Shimmer,
  Skeleton,
  Stage,
  StageList,
  Stamp,
  Title,
} from './AiScan.styles'

export type AiScanState = 'ready' | 'scanning' | 'answered' | 'unverified'

export type AiScanFact = {
  id: string
  label: string
  value: string
}

const STAGE_MS = 1700
const FACT_START_MS = 350
const FACT_GAP_MS = 420
const CHAR_MS = 18
const RING_MS = 1000
const NODES = [
  { x: 28, y: 32 },
  { x: 64, y: 22 },
  { x: 72, y: 58 },
  { x: 38, y: 70 },
  { x: 52, y: 44 },
]

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** Milliseconds since `key` last changed, ticking on animation frames until `limit`. */
function useElapsed(key: string, limit: number) {
  const [ms, setMs] = useState(0)
  useEffect(() => {
    if (prefersReducedMotion()) {
      setMs(limit)
      return
    }
    setMs(0)
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const elapsed = now - start
      setMs(Math.min(elapsed, limit))
      if (elapsed < limit) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [key, limit])
  return ms
}

/**
 * The photo while a provider reads it, then the answer typed in field by field.
 * `unverified` is every case where no provider vouched for a catalog class.
 */
export function AiScan({
  photo,
  state,
  facts = [],
  provider,
  probability,
  mode,
  notice,
  quiet = false,
  onRemove,
  removeLabel,
}: {
  photo: string
  state: AiScanState
  facts?: AiScanFact[]
  provider?: IdentifyProviderId
  probability?: number
  mode?: IdentifyMode
  tried?: IdentifyTried[]
  notice?: { title: string; body: string }
  /** Photo only. The answer panel lives on the review step. */
  quiet?: boolean
  /** Clears this photo. Used when there is no thumbnail strip under the scan. */
  onRemove?: () => void
  removeLabel?: string
}) {
  const { t } = useI18n()
  const stages = [t.addPlant.scanStage1, t.addPlant.scanStage2, t.addPlant.scanStage3]
  const revealEnd = FACT_START_MS + facts.length * FACT_GAP_MS + 600
  const limit = state === 'scanning' ? STAGE_MS * stages.length : Math.max(revealEnd, RING_MS)
  const ms = useElapsed(`${state}:${provider ?? ''}:${facts.length}`, limit)

  const stageIndex = Math.min(Math.floor(ms / STAGE_MS), stages.length - 1)
  const pct = probability != null ? Math.round(probability * 100) : null
  const shownPct = pct != null ? Math.round(pct * Math.min(1, ms / RING_MS)) : null
  const attributed = state === 'answered' && ms >= revealEnd - 300

  return (
    <Root data-state={state}>
      <Layout>
        <PhotoWell>
        <Frame $state={state}>
          <PlantImage src={photo} fallbackSrc={photo} alt="" />
          {state === 'scanning' ? (
            <>
              <Scanline aria-hidden />
              {NODES.map((node, index) => (
                <Node
                  key={index}
                  aria-hidden
                  style={{
                    insetInlineStart: `${node.x}%`,
                    insetBlockStart: `${node.y}%`,
                    animationDelay: `${index * 260}ms`,
                  }}
                />
              ))}
            </>
          ) : null}
          <Corner aria-hidden $at="ss" $state={state} />
          <Corner aria-hidden $at="se" $state={state} />
          <Corner aria-hidden $at="es" $state={state} />
          <Corner aria-hidden $at="ee" $state={state} />
          {state === 'answered' && attributed ? <Stamp $tone="ok">✦ {t.addPlant.stampVerified}</Stamp> : null}
          {state === 'unverified' ? <Stamp $tone="warn">{t.addPlant.stampUnverified}</Stamp> : null}
        </Frame>
          {onRemove ? (
            <Close type="button" aria-label={removeLabel} onClick={onRemove}>
              ×
            </Close>
          ) : null}
        </PhotoWell>

        {quiet ? null : <Panel aria-live="polite">
          {state === 'scanning' ? (
            <>
              <Head>
                <Title $sparkle>{t.addPlant.scanTitle}</Title>
              </Head>
              <StageList>
                {stages.map((label, index) => (
                  <Stage key={label} $state={index < stageIndex ? 'done' : index === stageIndex ? 'current' : 'next'}>
                    {label}
                  </Stage>
                ))}
              </StageList>
              <Shimmer aria-hidden />
              <Facts aria-hidden>
                {[0.9, 0.62, 0.75].map((width, index) => (
                  <Skeleton
                    key={index}
                    style={{
                      width: `${width * 100}%`,
                      animationDelay: `${index * 120}ms`,
                    }}
                  />
                ))}
              </Facts>
            </>
          ) : state === 'ready' ? (
            <Notice>
              <Title>{t.addPlant.photoReady}</Title>
              <Body>{t.addPlant.photoReadyBody}</Body>
            </Notice>
          ) : state === 'answered' ? (
            <>
              <Head>
                <Title>{t.addPlant.resultTitle}</Title>
                {shownPct != null ? (
                  <Ring
                    role="img"
                    aria-label={t.addPlant.confidencePct.replace('{pct}', String(pct))}
                    style={{ '--pct': shownPct } as CSSProperties}
                  >
                    <RingValue>{shownPct}%</RingValue>
                  </Ring>
                ) : null}
              </Head>
              <Facts>
                {facts.map((fact, index) => {
                  const start = FACT_START_MS + index * FACT_GAP_MS
                  const chars = Math.max(0, Math.floor((ms - start) / CHAR_MS))
                  const typing = chars > 0 && chars < fact.value.length
                  if (ms < start) return <Skeleton key={fact.id} style={{ width: '70%' }} />
                  return (
                    <Fact key={fact.id}>
                      <FactLabel>{fact.label}</FactLabel>
                      <FactValue>
                        {fact.value.slice(0, chars)}
                        {typing ? <Caret aria-hidden /> : null}
                      </FactValue>
                    </Fact>
                  )
                })}
              </Facts>
            </>
          ) : (
            <Notice>
              <Title>{notice?.title ?? t.addPlant.failedTitle}</Title>
              <Body>{notice?.body ?? t.addPlant.failedBody}</Body>
            </Notice>
          )}

          {state === 'answered' && attributed ? (
            <Attribution $in>
              <strong>{t.addPlant.verifiedBy}</strong>
              {mode === 'mock' ? <DemoNote>{t.addPlant.demoNote}</DemoNote> : null}
            </Attribution>
          ) : null}
        </Panel>}
      </Layout>
    </Root>
  )
}
