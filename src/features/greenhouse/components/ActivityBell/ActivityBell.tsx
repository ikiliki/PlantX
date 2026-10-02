import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Icon } from '../../../../components/Icon/Icon'
import { useI18n } from '../../../../i18n/I18nProvider'
import { useStore } from '../../../../mock/store'
import { ownerActivity } from '../../ownerActivity'
import { ActivityThread } from '../ActivityThread/ActivityThread'
import { Bell, Panel, Root } from './ActivityBell.styles'

export function ActivityBell({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const { fullDb, db, currentUser } = useStore()
  const { t, tr } = useI18n()
  const location = useLocation()
  const [open, setOpen] = useState(defaultOpen)
  const rootRef = useRef<HTMLDivElement>(null)
  const skipRouteClose = useRef(true)
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
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <Root ref={rootRef}>
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
          <ActivityThread activity={activity} />
        </Panel>
      )}
    </Root>
  )
}
