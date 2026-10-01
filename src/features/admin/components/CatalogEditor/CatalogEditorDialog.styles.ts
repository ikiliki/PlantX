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
  width: min(480px, 100%);
  max-height: min(90vh, 720px);
  overflow: auto;
  padding: 24px ${theme.space.lg} ${theme.space.lg};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
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
  margin: 0 36px 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.ink};
`

export const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid ${theme.colors.border};
`

export const PhotoRow = styled.button`
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 8px;
  border-radius: ${theme.radii.md};
  border: 1px dashed ${theme.colors.border};
  background: ${theme.colors.cream};
  text-align: start;
  cursor: pointer;
  color: ${theme.colors.ink};
`

export const PhotoPreview = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  background: ${theme.colors.chipGreen};
`

export const PhotoCopy = styled.span`
  display: grid;
  gap: 4px;
  strong {
    font-size: 14px;
  }
  small {
    font-size: 12px;
    color: ${theme.colors.muted};
  }
`
