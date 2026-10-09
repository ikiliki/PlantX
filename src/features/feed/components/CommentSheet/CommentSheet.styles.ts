import styled from 'styled-components'
import { backdropEnter, closeButton, dialogEnter, sheetBackdrop, sheetSurface } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

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
  grid-template-rows: auto minmax(0, 1fr);
  gap: 8px;
  width: min(480px, 100%);
  max-height: min(75svh, 640px);
  padding: 22px 16px 12px;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
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

export const Scroll = styled.div`
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
`
