import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

/** Comment and post text: wraps, at most three lines. */
export const Body = styled.span`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 420px;
  white-space: normal;
  overflow-wrap: anywhere;
`

export const Note = styled.p`
  margin: 0;
  font-size: ${theme.text.sm};
  color: ${theme.colors.muted};
`
