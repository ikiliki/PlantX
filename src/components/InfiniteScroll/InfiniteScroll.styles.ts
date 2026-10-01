import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Sentinel = styled.div`
  width: 100%;
  height: 1px;
  pointer-events: none;
`

export const Frame = styled.div`
  height: 220px;
  overflow-y: auto;
  width: min(320px, 100%);
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.cream};
`

export const Row = styled.p`
  margin: 0;
  padding: 14px 16px;
  border-bottom: 1px solid ${theme.colors.border};
  color: ${theme.colors.ink};
`
