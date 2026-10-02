import { Fragment, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Icon } from '../../../components/Icon/Icon'
import { NavItem, NavMark } from '../TopBar.styles'
import { Caret, Drop, Group, GroupLabel, Item, Nested, Panel, Rule, Trigger } from './NavMenu.styles'

export type NavMenuLink = {
  to: string
  label: string
  dividerBefore?: boolean
  matchPrefix?: boolean
  children?: NavMenuLink[]
  active?: (loc: { pathname: string; search: string }) => boolean
}

export function NavMenu({
  label,
  mark,
  to,
  items,
  open,
  onOpen,
  onClose,
}: {
  label: string
  mark?: string
  to: string
  items: NavMenuLink[]
  open: boolean
  onOpen: () => void
  onClose: () => void
}) {
  const loc = useLocation()
  const ref = useRef<HTMLDivElement>(null)
  const hide = useRef(0)
  const active = loc.pathname === to || (to !== '/' && loc.pathname.startsWith(to))
  const here = `${loc.pathname}${loc.search}${loc.hash}`

  useEffect(() => () => window.clearTimeout(hide.current), [])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose()
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
  }, [open, onClose])

  const isOn = (item: NavMenuLink) =>
    item.active
      ? item.active(loc)
      : item.matchPrefix
        ? loc.pathname === item.to || loc.pathname.startsWith(`${item.to}/`)
        : here === item.to

  return (
    <Drop
      ref={ref}
      onMouseEnter={() => {
        window.clearTimeout(hide.current)
        onOpen()
      }}
      onMouseLeave={() => {
        hide.current = window.setTimeout(onClose, 160)
      }}
    >
      <Trigger>
        <NavItem to={to} $active={active} aria-current={active ? 'page' : undefined}>
          {mark ? <NavMark aria-hidden>{mark}</NavMark> : null}
          {label}
        </NavItem>
        <Caret
          type="button"
          $open={open}
          aria-label={label}
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => (open ? onClose() : onOpen())}
        >
          <Icon name="chevron" size={14} />
        </Caret>
      </Trigger>
      {open && (
        <Panel role="menu">
          {items.map((item) =>
            item.children?.length ? (
              <Group key={item.to}>
                {item.dividerBefore && <Rule />}
                <GroupLabel to={item.to} onClick={onClose}>
                  {item.label}
                </GroupLabel>
                {item.children.map((child) => (
                  <Nested
                    key={child.to}
                    to={child.to}
                    role="menuitem"
                    $active={isOn(child)}
                    onClick={onClose}
                  >
                    {child.label}
                  </Nested>
                ))}
              </Group>
            ) : (
              <Fragment key={item.to}>
                {item.dividerBefore && <Rule />}
                <Item to={item.to} role="menuitem" $active={isOn(item)} onClick={onClose}>
                  {item.label}
                </Item>
              </Fragment>
            ),
          )}
        </Panel>
      )}
    </Drop>
  )
}
