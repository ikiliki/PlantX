import styled from 'styled-components'
import { backdropEnter, closeButton, dialogEnter, sheetBackdrop, sheetSurface } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${theme.z.dialogTop};
  display: grid;
  place-items: center;
  padding: ${theme.space.lg};
  background: ${theme.colors.overlay};
  ${backdropEnter}
  ${sheetBackdrop}
`

export const Dialog = styled.div`
  position: relative;
  width: min(640px, 100%);
  max-height: min(92vh, 860px);
  overflow: auto;
  padding: 28px ${theme.space.lg} ${theme.space.lg};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.cream};
  ${dialogEnter}
  ${sheetSurface}
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
  font-size: 22px;
  color: ${theme.colors.forest};
`

export const Note = styled.p`
  margin: 0 0 14px;
  font-size: 14px;
  line-height: 1.45;
  color: ${theme.colors.muted};
`
