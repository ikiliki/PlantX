import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Frame = styled.div`
  box-sizing: border-box;
  min-width: 0;
  padding: 16px;
  border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.cream};
  pointer-events: none;
`

export const Stage = styled.div`
  min-width: 0;
`

/** One collection card, so the preview reads as the card the switch shows or hides. */
export const CardSlot = styled.div`
  width: min(280px, 100%);
`

export const Off = styled.p`
  margin: 0;
  padding: 28px 16px;
  border-radius: ${theme.radii.md};
  border: 1px dashed ${theme.colors.border};
  background: ${theme.colors.cream};
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: ${theme.colors.muted};
`
