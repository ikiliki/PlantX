import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Wrap = styled.section`
  display: grid;
  justify-items: start;
  gap: 10px;
  max-width: 420px;
  padding: 8px 0 24px;
`

export const Title = styled.h2`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: 400;
  font-size: 28px;
  line-height: 1.15;
  color: ${theme.colors.forest};
`

export const Body = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: ${theme.colors.muted};
`
