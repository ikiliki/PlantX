import styled from 'styled-components'
import { backdropEnter, closeButton, dialogEnter, sheetBackdrop, sheetSurface } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 85;
  display: grid;
  place-items: center;
  padding: ${theme.space.md};
  background: ${theme.colors.overlay};
  ${backdropEnter}
  ${sheetBackdrop}
`

export const Frame = styled.div<{ $width: number }>`
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(${(p) => p.$width}px, 100%);
  max-height: min(86svh, 760px);
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.dialog};
  overflow: hidden;
  ${dialogEnter}
  ${sheetSurface}
`

export const Close = styled.button`
  ${closeButton}
  position: absolute;
  top: 12px;
  inset-inline-end: 12px;
  z-index: 2;
`

export const Head = styled.div`
  display: grid;
  gap: 6px;
  padding: 20px 56px 8px 20px;

  [dir='rtl'] & {
    padding: 20px 20px 8px 56px;
  }
`

export const Title = styled.h2`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: 24px;
  line-height: 1.15;
  color: ${theme.colors.forest};
`

export const Lead = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: ${theme.colors.muted};
`

export const Body = styled.div`
  display: grid;
  gap: ${theme.space.md};
  align-content: start;
  min-height: 0;
  padding: 8px 20px 16px;
  overflow-y: auto;
`

export const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 20px 18px;
  border-top: 1px solid ${theme.colors.border};
`
