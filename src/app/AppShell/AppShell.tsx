import { Outlet, useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n/I18nProvider'
import { useStore } from '../../mock/store'
import { DemoBar } from '../DemoBar/DemoBar'
import {
  BottomLink,
  BottomNav,
  Brand,
  BrandMark,
  LayoutBody,
  Main,
  NavLink,
  Shell,
  SideNav,
} from './AppShell.styles'

export function AppShell() {
  const { t } = useI18n()
  const { currentUser } = useStore()
  const loc = useLocation()
  const role = currentUser?.role

  const links = [
    { to: '/', label: t.nav.discover, show: true },
    { to: '/market', label: t.nav.market, show: true },
    { to: '/demand', label: t.nav.demand, show: true },
    { to: '/greenhouse', label: t.nav.greenhouse, show: role && role !== 'guest' },
    { to: '/sell', label: t.nav.sell, show: role === 'grower' || role === 'nursery' || role === 'collector' },
    { to: '/messages', label: t.nav.messages, show: role && role !== 'guest' },
    { to: '/business', label: t.nav.business, show: role === 'business' || role === 'admin' },
    { to: '/events', label: t.nav.events, show: role === 'event' || role === 'admin' },
    { to: '/admin', label: t.nav.admin, show: role === 'admin' },
    { to: '/claim', label: t.claim.title, show: true },
    { to: '/future/financing', label: t.nav.financing, show: true },
    { to: '/settings', label: t.nav.settings, show: true },
  ].filter((l) => l.show)

  const bottom = [
    { to: '/', label: t.nav.discover, icon: '⌂' },
    { to: '/market', label: t.nav.market, icon: '◈' },
    { to: '/demand', label: t.nav.demand, icon: '▣' },
    {
      to: role === 'business' ? '/business' : role === 'event' ? '/events' : '/greenhouse',
      label:
        role === 'business'
          ? t.nav.business
          : role === 'event'
            ? t.nav.events
            : t.nav.greenhouse,
      icon: '⚘',
    },
    { to: '/settings', label: t.nav.settings, icon: '⚙' },
  ]

  return (
    <Shell>
      <DemoBar />
      <LayoutBody>
        <SideNav>
          <Brand to="/">
            <BrandMark>🌿</BrandMark>
            {t.appName}
          </Brand>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} $active={loc.pathname === l.to || (l.to !== '/' && loc.pathname.startsWith(l.to))}>
              {l.label}
            </NavLink>
          ))}
        {!currentUser && (
          <NavLink to="/login" $active={loc.pathname === '/login'}>
            {t.nav.login}
          </NavLink>
        )}
      </SideNav>
        <Main>
          <Outlet />
        </Main>
      </LayoutBody>
      <BottomNav>
        {bottom.map((l) => (
          <BottomLink
            key={l.to}
            to={l.to}
            $active={loc.pathname === l.to || (l.to !== '/' && loc.pathname.startsWith(l.to))}
          >
            <span aria-hidden>{l.icon}</span>
            {l.label}
          </BottomLink>
        ))}
      </BottomNav>
    </Shell>
  )
}