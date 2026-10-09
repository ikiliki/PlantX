import { css, keyframes } from 'styled-components'
import { theme } from './tokens'

export const media = {
  sm: `@media (max-width: ${theme.breakpoints.sm})`,
  md: `@media (min-width: ${theme.breakpoints.md})`,
  lg: `@media (min-width: ${theme.breakpoints.lg})`,
}

export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

export const riseIn = keyframes`
  from { opacity: 0; transform: translateY(16px) scale(0.94); }
  to { opacity: 1; transform: none; }
`

/** A fill growing from the start edge. */
export const growX = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`

export const popIn = keyframes`
  from { opacity: 0; transform: translateY(10px) scale(0.97); }
  to { opacity: 1; transform: none; }
`

export const sheetUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: none; }
`

export const menuIn = keyframes`
  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
  to { opacity: 1; transform: none; }
`

export const backdropEnter = css`
  animation: ${fadeIn} ${theme.motion.base} ${theme.motion.ease} both;
  backdrop-filter: blur(3px);
`

/** Centered card on wider screens, bottom sheet on phones. */
export const dialogEnter = css`
  animation: ${popIn} ${theme.motion.slow} ${theme.motion.ease} both;
  box-shadow: ${theme.shadow.dialog};
  overscroll-behavior: contain;
  ${media.sm} {
    animation: ${sheetUp} ${theme.motion.slow} ${theme.motion.ease} both;
  }
`

export const sheetBackdrop = css`
  ${media.sm} {
    place-items: end center;
    padding: 0;
  }
`

export const sheetSurface = css`
  ${media.sm} {
    width: 100%;
    max-height: 92vh;
    border-end-start-radius: 0;
    border-end-end-radius: 0;
    padding-bottom: calc(${theme.space.lg} + env(safe-area-inset-bottom));
  }
`

export const closeButton = css`
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipNeutral};
  color: ${theme.colors.forest};
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition:
    background ${theme.motion.fast} ${theme.motion.ease},
    transform ${theme.motion.fast} ${theme.motion.ease};
  &:hover {
    background: ${theme.colors.chipGreen};
    transform: rotate(90deg);
  }
  &:active {
    transform: rotate(90deg) scale(0.92);
  }
`

export const pressable = css`
  transition:
    transform ${theme.motion.fast} ${theme.motion.ease},
    background ${theme.motion.fast} ${theme.motion.ease},
    color ${theme.motion.fast} ${theme.motion.ease},
    border-color ${theme.motion.fast} ${theme.motion.ease},
    box-shadow ${theme.motion.fast} ${theme.motion.ease};
  &:active:not(:disabled) {
    transform: translateY(2px) scale(0.98);
    transition-duration: 70ms;
  }
`
