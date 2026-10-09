import { useEffect } from 'react'
import { beginSave } from '../../lib/pendingSaves'
import { SaveIndicator } from './SaveIndicator'

export default {
  title: 'Components/SaveIndicator',
  component: SaveIndicator,
}

/** A save that takes two seconds, then lands: Saving…, then Saved. */
export const SaveCycle = () => {
  useEffect(() => {
    const end = beginSave()
    const timer = window.setTimeout(() => end(true), 2000)
    return () => window.clearTimeout(timer)
  }, [])
  return <SaveIndicator />
}
