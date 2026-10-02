import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

type Size = { $size: 'sm' | 'md' }

const RING = { sm: 44, md: 62 }

export const Root = styled.div<Size>`
  position: relative;
  flex: none;
  width: ${({ $size }) => RING[$size]}px;
  height: ${({ $size }) => RING[$size]}px;
`

/** Level number inside a ring that fills with progress to the next level. */
export const Ring = styled.div<Size>`
  --progress: 0;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background:
    radial-gradient(closest-side, ${theme.colors.forest} 76%, transparent 78%),
    conic-gradient(${theme.colors.growth} calc(var(--progress) * 360deg), rgba(18, 60, 45, 0.14) 0);
`

export const RingNumber = styled.span<Size>`
  font-family: ${theme.fonts.display};
  font-size: ${({ $size }) => ($size === 'sm' ? 19 : 26)}px;
  line-height: 1;
  color: ${theme.colors.growth};
`

/** The grower's avatar, pinned to the ring. */
export const OwnerBadge = styled.span<Size>`
  position: absolute;
  inset-inline-end: ${({ $size }) => ($size === 'sm' ? -5 : -6)}px;
  bottom: ${({ $size }) => ($size === 'sm' ? -3 : -4)}px;
  display: grid;
  border-radius: 50%;
  box-shadow: 0 0 0 ${({ $size }) => ($size === 'sm' ? 2 : 3)}px ${theme.colors.creamCard};
`
