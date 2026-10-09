import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Photo = styled.span`
  display: inline-block;
  width: 36px;
  height: 36px;
  margin-inline-end: 8px;
  border-radius: ${theme.radii.sm};
  overflow: hidden;
  vertical-align: middle;
  background: ${theme.colors.chipNeutral};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const Nested = styled.div`
  margin: 2px 0 6px;
  padding: 4px 8px 8px 28px;
  border-inline-start: 2px solid ${theme.colors.chipGreen};
`

export const TreeDialog = styled.div`
  position: relative;
  width: min(520px, 100%);
  max-height: min(90vh, 760px);
  overflow: auto;
  padding: 22px ${theme.space.lg} ${theme.space.lg};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.dialog};
`

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${theme.z.dialogTop};
  display: grid;
  place-items: center;
  padding: ${theme.space.lg};
  background: ${theme.colors.overlay};
`

export const Close = styled.button`
  position: absolute;
  top: 12px;
  inset-inline-end: 12px;
  width: 32px;
  height: 32px;
  margin: 0;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipNeutral};
  color: ${theme.colors.forest};
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
`

export const DialogTitle = styled.h2`
  margin: 0 36px 12px 0;
  font-family: ${theme.fonts.display};
  font-size: 22px;
  font-weight: ${theme.fonts.displayWeight};
  color: ${theme.colors.forest};
`
