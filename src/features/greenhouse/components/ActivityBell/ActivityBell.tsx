import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Icon } from '../../../../components/Icon/Icon'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { ownerActivity } from '../../ownerActivity'
import { ActivityThread } from '../ActivityThread/ActivityThread'
import { Bell, Close, Panel, Root } from './ActivityBell.styles'

export function ActivityBell({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const { fullDb, db, currentUser } = useStore()
  const { t, tr } = useI18n()
  const location = useLocation()
  const [open, setOpen] = useState(defaultOpen)
  const rootRef = useRef<HTMLDivElement>(null)
  const skipRouteClose = useRef(true)
  // Set by a pointerdown that went through the bell's React tree. Popups opened from the thread
  // (passport, water / photo moments) are portaled outside `Root` in the DOM, but React still
  // bubbles their events here, so a tap inside them is not a tap outside the sheet.
  const tapInside = useRef(false)
  const ownerId = currentUser?.id ?? ''
  const mine = db.plants.filter((plant) => plant.ownerId === ownerId)
  const activity = ownerActivity(fullDb, ownerId, mine, tr, t)

  useEffect(() => {
    if (skipRouteClose.current) {
      skipRouteClose.current = false
      return
    }
    setOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      const inside = tapInside.current || rootRef.current?.contains(event.target as Node)
      tapInside.current = false
      if (!inside) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      // Escape closes the popup on top first; the sheet stays for the next Escape.
      if (document.querySelector('[aria-modal="true"]')) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <Root
      ref={rootRef}
      onPointerDown={() => {
        tapInside.current = true
      }}
    >
      <Bell
        type="button"
        aria-label={t.greenhouse.activityTitle}
        aria-expanded={open}
        aria-haspopup="dialog"
        $open={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="bell" size={20} />
      </Bell>
      {open && (
        <Panel role="dialog" aria-label={t.greenhouse.activityTitle}>
          {/* A visible way out on a phone, besides the bell, Escape and tapping outside. */}
          <Close type="button" aria-label={t.http.dismiss} onClick={() => setOpen(false)}>
            ×
          </Close>
          <ActivityThread activity={activity} />
        </Panel>
      )}
    </Root>
  )
}
