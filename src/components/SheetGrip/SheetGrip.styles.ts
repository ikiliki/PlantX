import styled, { css } from 'styled-components'
import { theme } from '../../theme/tokens'

export const Grip = styled.div<{ $shown?: boolean }>`
  display: none;
  place-items: center;
  position: absolute;
  z-index: 4;
  top: 6px;
  left: 50%;
  width: 72px;
  height: 28px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: transparent;
  transform: translateX(-50%);
  touch-action: none;
  cursor: grab;

  &::before {
    content: '';
    width: 40px;
    height: 4px;
    border-radius: ${theme.radii.pill};
    background: color-mix(in srgb, var(--c-ink) 28%, transparent);
    transition: transform ${theme.motion.fast} ${theme.motion.ease}, background ${theme.motion.fast} ${theme.motion.ease};
  }

  &:active {
    cursor: grabbing;
  }

  &:active::before {
    transform: scaleX(1.15);
    background: color-mix(in srgb, var(--c-ink) 48%, transparent);
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    display: grid;
  }

  ${({ $shown }) =>
    $shown &&
    css`
      display: grid;
    `}
`
