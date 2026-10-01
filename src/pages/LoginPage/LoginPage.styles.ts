import styled from 'styled-components'
import { dialogEnter } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const Stack = styled.div`
  display: grid;
  justify-items: center;
  gap: 16px;
  width: min(380px, 100%);
`

export const Note = styled.p`
  margin: 0;
  max-width: 34ch;
  text-align: center;
  font-size: 16px;
  line-height: 1.5;
  color: ${theme.colors.muted};
`

export const Popup = styled.div`
  width: 100%;
  ${dialogEnter}
`
