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
  width: min(760px, 100%);
  max-height: min(92vh, 900px);
  overflow: auto;
  padding: 28px ${theme.space.lg} ${theme.space.lg};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.cream};
  container-type: inline-size;
  min-width: 0;
  ${dialogEnter}
  ${sheetSurface}

  @media (max-width: ${theme.breakpoints.md}) {
    width: 100%;
    max-height: min(92svh, 900px);
    padding: 22px ${theme.space.md} ${theme.space.md};
    border-radius: ${theme.radii.lg} ${theme.radii.lg} 0 0;
  }
`

export const Close = styled.button`
  ${closeButton}
  position: absolute;
  top: 12px;
  inset-inline-end: 12px;
`

export const Title = styled.h2`
  margin: 0;
  margin-bottom: 6px;
  margin-inline-end: 36px;
  font-family: ${theme.fonts.display};
  font-weight: 400;
  font-size: 28px;
  color: ${theme.colors.forest};
`

export const Note = styled.p`
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.45;
  color: ${theme.colors.muted};
`
