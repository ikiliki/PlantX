import styled from 'styled-components'
import { dialogEnter, pressable } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const Page = styled.div`
  position: relative;
  display: grid;
  place-items: center;
  min-height: calc(100svh - ${theme.layout.topBar} - ${theme.layout.bottomNav} - 32px);
  padding: ${theme.space.md};
  @media (min-width: ${theme.breakpoints.md}) {
    min-height: calc(100svh - ${theme.layout.topBar} - 48px);
  }
`

export const Popup = styled.div`
  position: relative;
  width: min(380px, 100%);
  ${dialogEnter}
`

export const Close = styled.button`
  ${pressable}
  position: absolute;
  top: 12px;
  inset-inline-end: 12px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: rgba(244, 241, 232, 0.16);
  color: ${theme.colors.cream};
  font: inherit;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  &:hover {
    background: rgba(244, 241, 232, 0.28);
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 2px;
  }
`
