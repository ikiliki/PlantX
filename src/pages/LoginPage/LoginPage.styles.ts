import styled from 'styled-components'
import { dialogEnter } from '../../theme/motion'

export const Stack = styled.div`
  display: grid;
  justify-items: center;
  gap: 16px;
  width: min(380px, 100%);
`

export const Popup = styled.div`
  width: 100%;
  ${dialogEnter}
`
