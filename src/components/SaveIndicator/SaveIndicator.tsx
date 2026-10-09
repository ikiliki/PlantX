import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../i18n/I18nProvider'
import { useSaveState } from '../../lib/pendingSaves'
import { Check, Pill, Spinner } from './SaveIndicator.styles'

/** A save shorter than this never shows the pill, so quick edits do not flash. */
const SHOW_AFTER_MS = 200
/** How long "Saved" stays once the last save landed. */
const SAVED_MS = 1200

type Phase = 'idle' | 'saving' | 'saved'

/**
 * One small pill at the top of the screen while anything is being saved (members and admin alike), then a
 * short "Saved". A failed save shows nothing here: the error popup (RequestNotice) already says so.
 */
export function SaveIndicator() {
  const { t } = useI18n()
  const { pending, lastFailed } = useSaveState()
  const [phase, setPhase] = useState<Phase>('idle')
  const shown = useRef(false)

  useEffect(() => {
    if (pending > 0) {
      const timer = window.setTimeout(() => {
        shown.current = true
        setPhase('saving')
      }, shown.current ? 0 : SHOW_AFTER_MS)
      return () => window.clearTimeout(timer)
    }
    if (!shown.current) return
    if (lastFailed) {
      shown.current = false
      setPhase('idle')
      return
    }
    setPhase('saved')
    const timer = window.setTimeout(() => {
      shown.current = false
      setPhase('idle')
    }, SAVED_MS)
    return () => window.clearTimeout(timer)
  }, [pending, lastFailed])

  return (
    <Pill role="status" aria-live="polite" $on={phase !== 'idle'} $saved={phase === 'saved'}>
      {phase === 'saved' ? <Check aria-hidden /> : <Spinner aria-hidden />}
      {phase === 'saved' ? t.common.saved : phase === 'saving' ? t.common.saving : ''}
    </Pill>
  )
}
