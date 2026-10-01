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
  width: min(1000px, calc(100vw - 32px));
  max-height: 50vh;
  overflow: hidden;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  ${dialogEnter}
  ${sheetSurface}
  ${media.md} {
    height: auto;
    max-height: 50vh;
  }
  ${media.sm} {
    max-height: 70vh;
    padding-bottom: env(safe-area-inset-bottom);
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
`

export const Close = styled.button`
  ${closeButton}
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
`
