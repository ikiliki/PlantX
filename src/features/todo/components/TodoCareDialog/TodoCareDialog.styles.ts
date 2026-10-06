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
  width: min(420px, 100%);
  max-height: min(92vh, 720px);
  overflow: auto;
  padding: 24px ${theme.space.lg} ${theme.space.lg};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.cream};
  container-type: inline-size;
  min-width: 0;
  ${dialogEnter}
  ${sheetSurface}

  @media (max-width: ${theme.breakpoints.md}) {
    width: 100%;
    max-height: min(88svh, 720px);
    padding: 20px ${theme.space.md} ${theme.space.md};
    border-radius: ${theme.radii.lg} ${theme.radii.lg} 0 0;
  }
`

export const Close = styled.button`
  ${closeButton}
  position: absolute;
  top: 12px;
  inset-inline-end: 12px;
`

export const DayHead = styled.p`
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${theme.colors.muted};
`

export const Title = styled.h2`
  margin: 0 0 16px;
  margin-inline-end: 36px;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: 24px;
  color: ${theme.colors.forest};
`

export const Body = styled.div`
  display: grid;
  gap: 12px;
  min-width: 0;
`
