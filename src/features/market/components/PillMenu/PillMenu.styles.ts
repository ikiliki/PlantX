import styled from 'styled-components'
import { backdropEnter, sheetUp } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const SheetBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${theme.z.dialog};
  display: flex;
  align-items: flex-end;
  background: ${theme.colors.overlay};
  ${backdropEnter}
`

export const Sheet = styled.div`
  display: grid;
  gap: 12px;
  width: 100%;
  max-height: 70svh;
  overflow-y: auto;
  padding: 10px ${theme.space.md} calc(${theme.space.lg} + env(safe-area-inset-bottom));
  border-radius: ${theme.radii.lg} ${theme.radii.lg} 0 0;
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.dialog};
  animation: ${sheetUp} ${theme.motion.base} ${theme.motion.ease} both;
`

export const SheetGrab = styled.span`
  justify-self: center;
  width: 44px;
  height: 5px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.track};
`
