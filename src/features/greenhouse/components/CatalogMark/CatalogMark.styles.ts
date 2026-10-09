import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.span`
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
  vertical-align: middle;
`

export const Thumb = styled.span<{ $size: number }>`
  display: block;
  flex: 0 0 auto;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${theme.radii.pill};
  overflow: hidden;
  background: ${theme.colors.chipGreen};
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--c-forest) 12%, transparent);
  opacity: 0.92;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const Label = styled.span`
  min-width: 0;
  overflow: hidden;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
  color: ${theme.colors.muted};
  text-overflow: ellipsis;
  white-space: nowrap;
`
