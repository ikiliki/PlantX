import { Link } from 'react-router-dom'
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
`

export const Frame = styled.div`
  position: relative;
  width: min(460px, 100%);
  max-height: min(92vh, 760px);
  overflow: auto;
  padding: 24px ${theme.space.lg} ${theme.space.lg};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  container-type: inline-size;
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

export const Form = styled.form`
  display: grid;
  gap: 16px;
  min-width: 0;
`

export const Head = styled.header`
  display: grid;
  gap: 6px;
  padding-inline-end: 40px;
  h2 {
    margin: 0;
    font-family: ${theme.fonts.display};
    font-size: 26px;
    font-weight: 400;
    line-height: 1.1;
    color: ${theme.colors.forest};
  }
  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.45;
    color: ${theme.colors.muted};
  }
`

export const Optional = styled.span`
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
  color: ${theme.colors.muted};
`

export const PhotoDrop = styled.button<{ $filled: boolean }>`
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 10px;
  border-radius: ${theme.radii.md};
  border: 1px ${({ $filled }) => ($filled ? 'solid' : 'dashed')} ${theme.colors.border};
  background: ${theme.colors.cream};
  color: ${theme.colors.ink};
  text-align: start;
  cursor: pointer;
  &:hover {
    border-color: ${theme.colors.moss};
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.moss};
    outline-offset: 2px;
  }
`

export const PhotoPreview = styled.span`
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  overflow: hidden;
  border-radius: 10px;
  background: ${theme.colors.chipGreen};
  color: ${theme.colors.forest};
  font-size: 24px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

export const PhotoText = styled.span`
  display: grid;
  gap: 2px;
  min-width: 0;
  strong {
    font-size: 14px;
  }
  small {
    font-size: 12px;
    color: ${theme.colors.muted};
  }
`

export const Problem = styled.p`
  margin: 0;
  padding: 10px 12px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipWarm};
  color: ${theme.colors.ink};
  font-size: 13px;
  line-height: 1.4;
`

export const ExistsLink = styled(Link)`
  font-weight: 700;
  color: ${theme.colors.forest};
`

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid ${theme.colors.border};
`

export const Done = styled.div`
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 16px 8px 4px;
  text-align: center;
  h2 {
    margin: 0;
    font-family: ${theme.fonts.display};
    font-size: 24px;
    font-weight: 400;
    color: ${theme.colors.forest};
  }
  p {
    margin: 0 0 8px;
    max-width: 34ch;
    font-size: 14px;
    line-height: 1.45;
    color: ${theme.colors.muted};
  }
`

export const DoneMark = styled.span`
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipGreen};
  color: ${theme.colors.forest};
  font-size: 26px;
  font-weight: 700;
`
