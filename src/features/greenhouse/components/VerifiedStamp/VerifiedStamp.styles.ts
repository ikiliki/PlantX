import styled, { css } from 'styled-components'
import { theme } from '../../../../theme/tokens'

const ink = css`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: none;
  border: 1.5px solid ${theme.colors.info};
  background: #e8f1f7;
  color: ${theme.colors.info};
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const Root = styled.span<{ $place: 'stamp' | 'inline' | 'icon' }>`
  ${ink}

  ${({ $place }) =>
    $place === 'icon'
      ? css`
          width: 18px;
          height: 18px;
          justify-content: center;
          border-radius: 999px;
          font-size: 11px;
        `
      : $place === 'stamp'
        ? css`
            position: absolute;
            z-index: 1;
            top: 10px;
            inset-inline-end: 10px;
            padding: 4px 7px;
            border-radius: 4px;
            font-size: 10px;
            transform: rotate(-8deg);
          `
        : css`
            position: relative;
            padding: 3px 6px;
            border-radius: 4px;
            font-size: 10px;
            transform: rotate(-6deg);
          `}
`
