import styled from 'styled-components'
import { backdropEnter, closeButton, dialogEnter, media, sheetBackdrop, sheetSurface, sheetUp } from '../../../../theme/motion'
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

  ${media.sm} {
    padding: 0;
    align-items: end;
  }
`

/** `$fit` sizes the dialog to its content (the guest message) instead of the full passport. */
export const Dialog = styled.div<{ $fit?: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: ${({ $fit }) => ($fit ? 'min(480px, calc(100vw - 24px))' : 'min(1160px, calc(100vw - 24px))')};
  height: ${({ $fit }) => ($fit ? 'auto' : 'min(840px, calc(100vh - 20px))')};
  max-height: min(840px, calc(100vh - 20px));
  overflow: hidden;
  scrollbar-width: none;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  container-type: inline-size;
  min-width: 0;
  ${dialogEnter}
  ${sheetSurface}
  ${media.sm} {
    width: 100%;
    height: ${({ $fit }) => ($fit ? 'auto' : '75svh')};
    max-height: 75svh;
    padding-top: 28px;
    padding-bottom: 0;
    border-radius: ${theme.radii.lg} ${theme.radii.lg} 0 0;
    scroll-behavior: auto;
    animation: ${sheetUp} 240ms ${theme.motion.ease} both;
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

/** A guest gets the log-in message instead of the passport. */
export const GuestPane = styled.div`
  padding: 48px ${theme.space.lg} ${theme.space.lg};
`

export const Close = styled.button`
  ${closeButton}
  pointer-events: auto;
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
`
