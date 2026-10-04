import styled from 'styled-components'
import { backdropEnter, closeButton, dialogEnter, sheetBackdrop, sheetSurface } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${theme.z.dialogTop};
  display: grid;
  place-items: center;
  padding: ${theme.space.md};
  background: ${theme.colors.overlay};
  ${backdropEnter}
  ${sheetBackdrop}

  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.space.sm};
    padding-bottom: calc(${theme.space.sm} + env(safe-area-inset-bottom));
    align-items: end;
  }
`

export const Dialog = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(480px, 100%);
  height: min(640px, 86vh);
  overflow: hidden;
  padding: 52px 20px 16px;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.cream};
  container-type: inline-size;
  min-width: 0;
  ${dialogEnter}
  ${sheetSurface}

  /* The Planted screen needs less room on desktop; the phone sheet keeps its height. */
  @media not all and (max-width: ${theme.breakpoints.md}) {
    &:has([data-add-done]) {
      height: min(500px, 86vh);
    }
  }

  @media (max-width: ${theme.breakpoints.md}) {
    width: 100%;
    height: min(640px, 82svh);
    padding: 52px ${theme.space.md} ${theme.space.md};
    border-radius: ${theme.radii.lg} ${theme.radii.lg} 0 0;
  }
`

export const Close = styled.button`
  ${closeButton}
  position: absolute;
  top: 12px;
  inset-inline-end: 12px;
`

