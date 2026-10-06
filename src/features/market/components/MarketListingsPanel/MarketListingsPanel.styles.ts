import styled, { css } from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.section<{ $embedded?: boolean }>`
  display: grid;
  gap: 10px;
  min-width: 0;
  ${({ $embedded }) =>
    $embedded &&
    css`
      flex: 1 1 auto;
      min-height: 0;
      align-content: start;
    `}
`

export const Title = styled.h3`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-size: 22px;
  font-weight: ${theme.fonts.displayWeight};
  color: ${theme.colors.forest};
`

export const TableWrap = styled.div<{ $embedded?: boolean }>`
  min-width: 0;
  ${({ $embedded }) =>
    $embedded &&
    css`
      max-height: 240px;
      overflow: auto;
      overscroll-behavior: contain;
    `}
`
