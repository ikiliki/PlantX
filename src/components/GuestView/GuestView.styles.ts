import styled, { css } from 'styled-components'
import { theme } from '../../theme/tokens'

export const Wrap = styled.section<{ $card?: boolean }>`
  display: grid;
  justify-items: start;
  gap: 10px;
  max-width: 420px;
  min-width: 0;
  padding: 8px 0 24px;

  ${({ $card }) =>
    $card &&
    css`
      width: min(400px, 100%);
      padding: ${theme.space.lg};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.lg};
      background: ${theme.colors.creamCard};
      box-shadow: ${theme.shadow.lift};
    `}
`

export const Title = styled.h2`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: 28px;
  line-height: 1.15;
  color: ${theme.colors.forest};
`

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
`

export const Body = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: ${theme.colors.muted};
`
