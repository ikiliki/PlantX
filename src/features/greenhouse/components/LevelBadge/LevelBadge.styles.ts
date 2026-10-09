import styled, { css, keyframes } from 'styled-components'
import { theme } from '../../../../theme/tokens'

type Size = { $size: 'sm' | 'md' }

const RING = { sm: 44, md: 62 }

/** The ring fills from empty to the grower's progress, slowly, when it arrives. */
const fill = keyframes`
  from { --progress: 0; }
`

const numberIn = keyframes`
  from { opacity: 0; transform: translateY(6px) scale(0.8); }
  to { opacity: 1; transform: none; }
`

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
    radial-gradient(closest-side, ${theme.colors.deep} 76%, transparent 78%),
    conic-gradient(${theme.colors.growth} calc(var(--progress) * 360deg), color-mix(in srgb, var(--c-forest) 14%, transparent) 0);
  animation: ${fill} 1.8s cubic-bezier(0.22, 1, 0.36, 1) 300ms both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const RingNumber = styled.span<Size>`
  font-family: ${theme.fonts.display};
  font-size: ${({ $size }) => ($size === 'sm' ? 19 : 26)}px;
  line-height: 1;
  color: ${theme.colors.growth};
  animation: ${numberIn} 900ms ${theme.motion.ease} 900ms both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const pinned = css<Size>`
  position: absolute;
  inset-inline-end: ${({ $size }) => ($size === 'sm' ? -5 : -6)}px;
  bottom: ${({ $size }) => ($size === 'sm' ? -3 : -4)}px;
  display: grid;
  border-radius: 50%;
  box-shadow: 0 0 0 ${({ $size }) => ($size === 'sm' ? 2 : 3)}px ${theme.colors.creamCard};
`

/** The grower's avatar, pinned to the ring. */
export const OwnerBadge = styled.span<Size>`
  ${pinned}
`

/** The same pinned avatar as a button: on a grower's public greenhouse it opens their profile preview. */
export const OwnerButton = styled.button<Size>`
  ${pinned}
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  transition: transform 160ms ${theme.motion.ease};

  &:hover {
    transform: scale(1.08);
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.forest};
    outline-offset: 2px;
  }
`
