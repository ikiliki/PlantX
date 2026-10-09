import { Fragment, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useDialogLayer } from '../../lib/dialogLayer'
import type { NavMenuLink } from '../TopBar/NavMenu/NavMenu'
import { Item, Panel, Rule } from './DockMenu.styles'

function isOn(item: NavMenuLink, loc: { pathname: string; search: string; hash: string }) {
  if (item.active) return item.active(loc)
  return `${loc.pathname}${loc.search}${loc.hash}` === item.to
}

/**
 * The phone dock's ^ menu (also opened by holding the item): its sub-pages, rising above the dock. `title`
 * names it for screen readers. Top-level entries only (the desktop drop-down also nests the catalog's plants).
 * A tap outside, Escape or any navigation closes it.
 */
export function DockMenu({
  id,
  title,
  items,
  onClose,
}: {
  id: string
  title: string
  items: NavMenuLink[]
  onClose: () => void
}) {
  const loc = useLocation()
  const ref = useRef<HTMLDivElement>(null)
  const opened = useRef(`${loc.pathname}${loc.search}${loc.hash}`)
  // A layer: back closes the menu instead of leaving the page.
  useDialogLayer(onClose)

  useEffect(() => {
    if (`${loc.pathname}${loc.search}${loc.hash}` !== opened.current) onClose()
  }, [loc.pathname, loc.search, loc.hash, onClose])

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Element | null
      if (ref.current?.contains(target as Node)) return
      // The ^ that opened it toggles it itself.
      if (target?.closest?.(`[aria-controls="${id}"]`)) return
      onClose()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [id, onClose])

  return (
    <Panel ref={ref} id={id} role="menu" aria-label={title}>
      {items.map((item) => (
        <Fragment key={item.to}>
          {item.dividerBefore ? <Rule /> : null}
          <Item to={item.to} role="menuitem" $on={isOn(item, loc)} onClick={onClose}>
            {item.label}
          </Item>
        </Fragment>
      ))}
    </Panel>
  )
}
