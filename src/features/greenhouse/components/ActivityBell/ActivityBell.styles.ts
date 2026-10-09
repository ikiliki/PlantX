import styled from 'styled-components'
import { backdropEnter, closeButton, dialogEnter, pressable, sheetBackdrop, sheetSurface } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Bell = styled.button<{ $open?: boolean }>`
  ${pressable}
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${({ $open }) => ($open ? theme.colors.chipGreen : theme.colors.chipNeutral)};
  color: ${theme.colors.forest};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 2px;
  }
`

/** Bottom sheet on a phone (the only place the bell shows); a centred card if the window is wider. */
export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${theme.z.dialog};
  display: grid;
  place-items: center;
  padding: ${theme.space.md};
  background: ${theme.colors.overlay};
  ${backdropEnter}
  ${sheetBackdrop}
`

export const Sheet = styled.div`
  position: relative;
  display: grid;
  gap: 4px;
  width: min(440px, 100%);
  padding: 22px 16px 12px;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  container-type: inline-size;
  ${dialogEnter}
  ${sheetSurface}
`

export const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

export const Title = styled.h2`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: ${theme.text.lg};
  color: ${theme.colors.ink};
`

export const Close = styled.button`
  ${closeButton}
  flex: none;
`
