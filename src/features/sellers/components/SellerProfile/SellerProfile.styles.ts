import styled, { css } from 'styled-components'
import { media } from '../../../../theme/motion'

export const Root = styled.div<{ $dialog?: boolean }>`
  display: grid;
  min-height: 0;
  ${({ $dialog }) =>
    $dialog &&
    css`
      display: flex;
      flex: 1 1 auto;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
      > :first-child {
        flex: 0 0 auto;
      }
      > :last-child {
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        min-height: 0;
      }
    `}
  ${({ $dialog }) =>
    !$dialog &&
    css`
      ${media.md} {
        grid-template-columns: minmax(280px, 330px) minmax(0, 1fr);
        grid-template-rows: minmax(0, auto);
        height: 100%;
        min-height: 0;
      }
    `}
`
