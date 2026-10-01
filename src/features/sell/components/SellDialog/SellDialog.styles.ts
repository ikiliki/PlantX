import styled from 'styled-components'
import { backdropEnter, closeButton, dialogEnter, media, sheetBackdrop, sheetSurface } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${theme.z.dialog};
  display: grid;
  place-items: center;
  padding: ${theme.space.lg};
  background: ${theme.colors.overlay};
  ${backdropEnter}
  ${sheetBackdrop}
`

export const Dialog = styled.div`
  position: relative;
  width: min(1100px, 100%);
  max-height: min(92vh, 920px);
  overflow: auto;
  padding: 28px 28px ${theme.space.xl};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.cream};
  ${dialogEnter}
  ${sheetSurface}
  ${media.sm} {
    padding-inline: ${theme.space.md};
  }
`

export const Close = styled.button`
  ${closeButton}
  position: absolute;
  top: ${theme.space.md};
  inset-inline-end: ${theme.space.md};
  z-index: 1;
`
