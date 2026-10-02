import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Band = styled.section`
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: 0 ${theme.space.md} 48px;
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @container landing (min-width: 900px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

export const Proof = styled.article`
  background: rgba(255, 253, 248, 0.65);
  border: 1px solid ${theme.colors.border};
  border-radius: 18px;
  padding: 18px;

  strong {
    display: block;
    font-family: ${theme.fonts.display};
    font-weight: 400;
    font-size: 20px;
    color: ${theme.colors.forest};
  }

  span {
    font-size: 12px;
    color: ${theme.colors.muted};
  }
`
