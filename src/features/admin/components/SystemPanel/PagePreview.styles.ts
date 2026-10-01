import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

/** The page, shown in page configuration as its own scrolling window. */
export const Page = styled.div`
  box-sizing: border-box;
  min-width: 0;
  max-height: min(640px, 70svh);
  overflow: auto;
  overscroll-behavior: contain;
  padding: 16px;
  border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.cream};
`

export const Stage = styled.div`
  min-width: 0;
  pointer-events: none;
`
