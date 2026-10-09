import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'
import { scrollReveal } from '../../landingType'

export const Band = styled.section`
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: 0 ${theme.space.md} 48px;

  @container landing (min-width: 900px) {
    padding: 0 28px 64px;
  }
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;

  @container landing (min-width: 900px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

export const Proof = styled.article`
  ${scrollReveal}
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  column-gap: 14px;
  align-items: start;
  background: ${theme.colors.creamCard};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadow.card};
  padding: 20px;

  > svg {
    grid-row: span 2;
    box-sizing: content-box;
    padding: 10px;
    border-radius: ${theme.radii.sm};
    background: ${theme.colors.growth};
    color: ${theme.colors.onGrowth};
  }

  strong {
    display: block;
    font-family: ${theme.fonts.display};
    font-weight: ${theme.fonts.displayWeight};
    font-size: 20px;
    color: ${theme.colors.forest};
  }

  span {
    display: block;
    margin-top: 6px;
    font-size: 14px;
    line-height: 1.5;
    color: ${theme.colors.muted};
  }
`
