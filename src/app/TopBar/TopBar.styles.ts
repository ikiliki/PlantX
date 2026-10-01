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
  height: 68px;
  padding: 0 ${theme.space.md};
  background: ${({ $scrolled }) => ($scrolled ? 'rgba(255, 254, 250, 0.86)' : theme.colors.creamCard)};
  backdrop-filter: ${({ $scrolled }) => ($scrolled ? 'blur(14px) saturate(1.2)' : 'none')};
  border-bottom: 1px solid ${theme.colors.border};
  box-shadow: ${({ $scrolled }) => ($scrolled ? theme.shadow.soft : 'none')};
  transition:
    background ${theme.motion.base} ${theme.motion.ease},
    box-shadow ${theme.motion.base} ${theme.motion.ease};
  @media (min-width: ${theme.breakpoints.md}) {
    height: ${theme.layout.topBar};
    padding: 0 56px;
  }
`

export const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  font-family: ${theme.fonts.display};
  font-weight: 400;
  font-size: 24px;
  color: ${theme.colors.forest};
  @media (min-width: 900px) {
    font-size: 28px;
  }
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
    display: flex;
    align-items: center;
    gap: 22px;
    min-width: 0;
    overflow: visible;
  }
`

export const NavItem = styled(Link)<{ $active?: boolean }>`
  position: relative;
  padding: 6px 0;
  font-size: 14px;
  white-space: nowrap;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  color: ${({ $active }) => ($active ? theme.colors.forest : theme.colors.muted)};
  transition: color ${theme.motion.fast} ${theme.motion.ease};
  &::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    height: 2px;
    border-radius: ${theme.radii.pill};
    background: ${theme.colors.forest};
    transform: scaleX(${({ $active }) => ($active ? 1 : 0)});
    transition: transform ${theme.motion.base} ${theme.motion.ease};
  }
  &:hover {
    color: ${theme.colors.forest};
  }
  &:hover::after {
    transform: scaleX(1);
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

export const Account = styled.div`
  position: relative;
`

export const AvatarBubble = styled.button`
  ${pressable}
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipGreen};
  color: ${theme.colors.forest};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  &:hover {
    box-shadow: 0 0 0 3px ${theme.colors.chipGreen};
  }
`

export const AvatarLink = styled(Link)`
  ${pressable}
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipGreen};
  color: ${theme.colors.forest};
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  &:hover {
    box-shadow: 0 0 0 3px ${theme.colors.chipGreen};
  }
`

export const AccountCluster = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

export const MenuToggle = styled.button`
  ${pressable}
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: transparent;
  color: ${theme.colors.forest};
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background: ${theme.colors.chipGreen};
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
  min-width: 168px;
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
  color: ${theme.colors.creamCard};
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  text-decoration: none;
  box-shadow: ${theme.shadow.soft};
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
