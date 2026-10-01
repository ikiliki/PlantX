import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Stack = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${theme.space.xl};
  min-width: 0;
`
