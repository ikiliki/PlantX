import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'
import { menuIn, pressable } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const Bar = styled.header<{ $scrolled?: boolean }>`
  position: sticky;
  top: 0;
  z-index: ${theme.z.topBar};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.space.md};
  height: calc(68px + env(safe-area-inset-top));
  padding: env(safe-area-inset-top) ${theme.space.md} 0;
  background: ${({ $scrolled }) => ($scrolled ? theme.surface.barScrolled : theme.surface.bar)};
  border-bottom: 1px solid ${theme.surface.barBorder};
  box-shadow: ${({ $scrolled }) => ($scrolled ? theme.shadow.soft : 'none')};
  transition:
    background ${theme.motion.base} ${theme.motion.ease},
    box-shadow ${theme.motion.base} ${theme.motion.ease};
  @media (min-width: ${theme.breakpoints.md}) {
    height: ${theme.layout.topBar};
    padding: 0 40px;
  }
`

export const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: 24px;
  color: ${theme.surface.barInk};
`

export const BrandMark = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: transform ${theme.motion.slow} ${theme.motion.spring};
  a:hover > & {
    transform: rotate(-12deg) scale(1.06);
  }
`

export const NavItems = styled.nav`
  display: none;
  @media (min-width: ${theme.breakpoints.md}) {
    /* Desktop: the nav sits in the top bar as a row of pebbles, centred between the wordmark and the account. */
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    padding: 5px;
    border-radius: ${theme.radii.pill};
    background: ${theme.colors.creamCard};
    box-shadow: ${theme.shadow.soft};
    overflow: visible;
  }
`

export const NavMark = styled.span`
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  margin-inline-end: 6px;
  border-radius: 7px;
  background: ${theme.colors.chipGreen};
  color: ${theme.colors.forest};
  font-family: ${theme.fonts.body};
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
`

export const NavItem = styled(Link)<{ $active?: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 14px;
  border-radius: ${theme.radii.pill};
  background: ${({ $active }) => ($active ? theme.colors.growth : 'transparent')};
  font-family: ${theme.fonts.display};
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  color: ${({ $active }) => ($active ? theme.colors.onGrowth : theme.surface.barMuted)};
  transition:
    color ${theme.motion.fast} ${theme.motion.ease},
    background ${theme.motion.base} ${theme.motion.ease},
    transform ${theme.motion.base} ${theme.motion.ease};
  &:hover {
    color: ${({ $active }) => ($active ? theme.colors.onGrowth : theme.surface.barInk)};
    background: ${({ $active }) => ($active ? theme.colors.growth : theme.colors.chipGreen)};
    transform: translateY(-1px);
  }

  /* Mid widths: icons only so the bar never overflows; the label stays the accessible name. */
  @media (min-width: ${theme.breakpoints.md}) and (max-width: 1180px) {
    padding: 0 14px;
    font-size: 0;

    > span:first-child {
      margin: 0;
    }
  }
  &:active {
    transform: translateY(1px) scale(0.96);
  }
`

/** Icon in front of a nav label; each design direction decides whether the top bar shows it. */
export const NavIcon = styled.span`
  display: none;
  flex: none;
  place-items: center;
  margin-inline-end: 8px;

  @media (min-width: ${theme.breakpoints.md}) {
    display: inline-grid;
  }
`

/** Greenhouse activity bell sits with the account control on the phone shell only. */
export const MobileOnly = styled.div`
  display: contents;

  @media (min-width: ${theme.breakpoints.md}) {
    display: none;
  }
`

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
`

export const Lang = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipNeutral};
  border: 1px solid ${theme.colors.border};
`

export const LangBtn = styled.button<{ $on?: boolean }>`
  ${pressable}
  flex: 1;
  min-height: 30px;
  margin: 0;
  padding: 0 10px;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.creamCard : 'transparent')};
  color: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.muted)};
  font: inherit;
  font-size: 12px;
  font-weight: ${({ $on }) => ($on ? 700 : 600)};
  box-shadow: ${({ $on }) => ($on ? theme.shadow.soft : 'none')};
  cursor: pointer;
  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 2px;
  }
`

export const MenuLang = styled.div`
  display: grid;
  gap: 8px;
  margin: 2px 0;
  padding: 10px 12px 12px;
  border-radius: ${theme.radii.sm};

  > span {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: ${theme.type.labelTracking};
    text-transform: ${theme.type.labelCase};
    color: ${theme.colors.muted};
  }

  ${Lang} {
    width: 100%;
    justify-content: stretch;
    background: ${theme.colors.chipNeutral};
  }

  ${LangBtn} {
    min-height: 32px;
    padding: 0 12px;
    font-size: 13px;
  }
`

export const Account = styled.div`
  position: relative;
`

export const AvatarBubble = styled.button<{ $open?: boolean }>`
  ${pressable}
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: transparent;
  color: ${theme.colors.forest};
  overflow: hidden;
  cursor: pointer;
  text-decoration: none;
  box-shadow: ${({ $open }) => ($open ? `0 0 0 3px ${theme.colors.chipGreen}` : 'none')};
  &:hover {
    box-shadow: 0 0 0 3px ${theme.colors.chipGreen};
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 2px;
  }
`

export const Menu = styled.div`
  animation: ${menuIn} ${theme.motion.base} ${theme.motion.ease} both;
  transform-origin: top right;
  [dir='rtl'] & {
    transform-origin: top left;
  }
  position: absolute;
  top: calc(100% + 8px);
  inset-inline-end: 0;
  min-width: 188px;
  padding: 6px;
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  box-shadow: ${theme.shadow.card};
  z-index: ${theme.z.menu};
`

const item = css<{ $active?: boolean; $split?: boolean }>`
  display: block;
  width: 100%;
  transition: background ${theme.motion.fast} ${theme.motion.ease};
  padding: 10px 12px;
  border: 0;
  border-radius: ${theme.radii.sm};
  background: ${({ $active }) => ($active ? theme.colors.chipNeutral : 'transparent')};
  color: ${({ $active }) => ($active ? theme.colors.forest : theme.colors.ink)};
  font: inherit;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  text-align: start;
  cursor: pointer;
  ${({ $split }) =>
    $split &&
    css`
      margin-top: 4px;
      border-top: 1px solid ${theme.colors.border};
      border-radius: 0 0 ${theme.radii.sm} ${theme.radii.sm};
    `}
  &:hover {
    background: ${theme.colors.chipNeutral};
  }
`

export const MenuItem = styled(Link)<{ $active?: boolean; $split?: boolean }>`
  ${item}
`

export const MenuButton = styled.button<{ $active?: boolean; $split?: boolean }>`
  ${item}
`

export const LoginButton = styled(Link)`
  ${pressable}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 18px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.cream};
  font-family: ${theme.fonts.display};
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;
  box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.22), ${theme.shadow.soft};
  transition:
    background ${theme.motion.fast} ${theme.motion.ease},
    box-shadow ${theme.motion.base} ${theme.motion.ease},
    transform ${theme.motion.fast} ${theme.motion.spring};
  &:hover {
    background: ${theme.colors.forestMid};
    box-shadow: ${theme.shadow.lift};
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 3px;
  }
`

export const LoginLink = styled(Link)`
  ${pressable}
  padding: ${theme.space.sm} ${theme.space.md};
  border-radius: ${theme.radii.pill};
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.forest};
  white-space: nowrap;
  &:hover {
    background: ${theme.colors.chipGreen};
  }
`
