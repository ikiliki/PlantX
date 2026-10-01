import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Frame = styled.div`
  display: grid;
  place-items: center;
  width: 100%;
  min-height: min(560px, 72svh);
  padding: ${theme.space.lg} ${theme.space.md};
`
