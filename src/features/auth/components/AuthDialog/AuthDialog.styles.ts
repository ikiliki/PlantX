import styled from 'styled-components'
import { backdropEnter, closeButton, dialogEnter, sheetBackdrop } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: ${theme.space.md};
  background: ${theme.colors.overlay};
  ${backdropEnter}
  ${sheetBackdrop}
`

export const Frame = styled.div`
  position: relative;
  width: min(380px, 100%);
  ${dialogEnter}
`

export const Close = styled.button`
  ${closeButton}
  position: absolute;
  top: 14px;
  inset-inline-end: 14px;
  z-index: 2;
`
