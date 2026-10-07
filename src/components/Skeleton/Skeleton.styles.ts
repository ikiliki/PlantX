import styled, { css, keyframes } from 'styled-components'
import { theme } from '../../theme/tokens'

const sweep = keyframes`
  from { background-position: 100% 0; }
  to { background-position: -100% 0; }
`

export const Bar = styled.span<{ $width: string; $height: number; $round: boolean }>`
  display: block;
  flex: none;
  width: ${({ $width }) => $width};
  max-width: 100%;
  height: ${({ $height }) => `${$height}px`};
  border-radius: ${({ $round }) => ($round ? '50%' : theme.radii.pill)};
  background: linear-gradient(
    100deg,
    ${theme.colors.chipGreen} 30%,
    ${theme.colors.creamCard} 50%,
    ${theme.colors.chipGreen} 70%
  );
  background-size: 200% 100%;
  animation: ${sweep} 1.8s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background: ${theme.colors.chipNeutral};
  }
`

/** Wraps a placeholder that should look out of reach (the guest view). */
export const blurred = css`
  filter: blur(3px);
  opacity: 0.85;
  pointer-events: none;
  user-select: none;
`
