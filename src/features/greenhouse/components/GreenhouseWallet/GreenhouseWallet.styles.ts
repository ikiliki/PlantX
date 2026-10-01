import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.aside`
  display: grid;
  align-content: start;
  gap: 4px;
  width: min(220px, 100%);
  margin: 0;
  padding: 0;
  color: ${theme.colors.forest};
  text-align: end;

  @container (max-width: 720px) {
    width: 100%;
    text-align: start;
  }
`

export const Label = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Value = styled.p`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-size: clamp(28px, 3vw, 36px);
  font-weight: 400;
  line-height: 1.05;
  color: ${theme.colors.forest};
`

export const MarketValue = styled.div<{ $held?: boolean }>`
  display: grid;
  gap: 4px;
  ${({ $held }) =>
    $held &&
    `
    filter: blur(6px);
    user-select: none;
    pointer-events: none;
  `}
`

export const ValueLabel = styled.span`
  display: block;
  font-size: 12px;
  line-height: 1.35;
  color: ${theme.colors.muted};
`
