import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Note = styled.div`
  display: grid;
  gap: 6px;
  padding: 4px 0 2px;
  color: ${theme.colors.muted};
  font-size: 13px;
  line-height: 1.45;
  overflow-wrap: anywhere;

  strong {
    color: ${theme.colors.warn};
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
`
