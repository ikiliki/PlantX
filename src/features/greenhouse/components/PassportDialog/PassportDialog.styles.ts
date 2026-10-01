import styled from 'styled-components'
import { backdropEnter, closeButton, dialogEnter, media, sheetBackdrop, sheetSurface } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${theme.z.dialog - 2};
  display: grid;
  place-items: center;
  padding: ${theme.space.md};
  background: ${theme.colors.overlay};
  overflow: hidden;
  ${backdropEnter}
  ${sheetBackdrop}
`

export const Dialog = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(1160px, calc(100vw - 24px));
  height: min(840px, calc(100vh - 20px));
  max-height: min(840px, calc(100vh - 20px));
  overflow: hidden;
  scrollbar-width: none;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  ${dialogEnter}
  ${sheetSurface}
  ${media.sm} {
    height: 94vh;
    max-height: 94vh;
    padding-bottom: 0;
  }
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
  &:focus,
  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.dialog};
  }
`

export const CloseBar = styled.div`
  position: absolute;
  z-index: 3;
  inset-block-start: 12px;
  inset-inline-end: 12px;
  pointer-events: none;
`

export const Close = styled.button`
  ${closeButton}
  pointer-events: auto;
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
`
