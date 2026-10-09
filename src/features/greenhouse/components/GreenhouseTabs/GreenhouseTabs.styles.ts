import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

/** Phone: sticks under the 68px top bar (plus the notch). Desktop: sits at the head of the page. */
export const Bar = styled.nav`
  position: sticky;
  top: calc(76px + env(safe-area-inset-top));
  z-index: ${theme.z.floating};
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
  width: 100%;
  padding: 5px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};

  @media (min-width: ${theme.breakpoints.md}) {
    position: static;
    width: min(460px, 100%);
  }
`

export const Tab = styled(Link)<{ $on: boolean }>`
  ${pressable}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 14px;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.growth : 'transparent')};
  color: ${({ $on }) => ($on ? theme.colors.onGrowth : theme.colors.muted)};
  font-family: ${theme.fonts.display};
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;

  &:hover {
    background: ${({ $on }) => ($on ? theme.colors.growth : theme.colors.chipGreen)};
    color: ${({ $on }) => ($on ? theme.colors.onGrowth : theme.colors.forest)};
  }
`

export const Back = styled(Link)`
  ${pressable}
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-self: start;
  min-height: 40px;
  padding: 0 16px 0 10px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
  color: ${theme.colors.forest};
  font-family: ${theme.fonts.display};
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;

  svg {
    width: 18px;
    height: 18px;
  }

  [dir='rtl'] & svg {
    transform: scaleX(-1);
  }

  &:hover {
    background: ${theme.colors.chipGreen};
  }
`
