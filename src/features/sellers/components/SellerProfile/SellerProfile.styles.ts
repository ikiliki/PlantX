import styled, { css } from 'styled-components'
import { media } from '../../../../theme/motion'

export const Root = styled.div<{ $dialog?: boolean }>`
  display: grid;
  min-height: 0;
  ${({ $dialog }) =>
    $dialog &&
    css`
      max-height: 50vh;
      ${media.sm} {
        max-height: 70vh;
      }
    `}
  ${media.md} {
    grid-template-columns: minmax(280px, 330px) minmax(0, 1fr);
    grid-template-rows: minmax(0, auto);
    height: ${({ $dialog }) => ($dialog ? 'auto' : '100%')};
    min-height: 0;
    max-height: ${({ $dialog }) => ($dialog ? '50vh' : 'none')};
  }
`
