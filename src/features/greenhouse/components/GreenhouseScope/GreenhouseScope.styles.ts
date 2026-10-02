import styled, { keyframes } from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

/** The switch folding into a round back button: it narrows, then the arrow swings in. */
const morphIn = keyframes`
  0% { width: 104px; opacity: 0.6; }
  60% { width: 46px; opacity: 1; }
  100% { width: 46px; }
`

const arrowIn = keyframes`
  from { opacity: 0; transform: translateX(8px) rotate(-90deg); }
  to { opacity: 1; transform: none; }
`

export const Back = styled.button`
  ${pressable}
  position: fixed;
  z-index: ${theme.z.floating};
  inset-inline: 0;
  margin-inline: auto;
  bottom: calc(${theme.layout.bottomNav} + ${theme.space.md} + env(safe-area-inset-bottom));
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  padding: 0;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.forest};
  box-shadow: ${theme.shadow.lift};
  cursor: pointer;
  overflow: hidden;
  animation: ${morphIn} 420ms ${theme.motion.ease} both;

  svg {
    width: 20px;
    height: 20px;
    animation: ${arrowIn} 420ms ${theme.motion.ease} 120ms both;
  }

  /* RTL: back points the other way. */
  [dir='rtl'] & svg {
    transform: scaleX(-1);
    animation: none;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    svg {
      animation: none;
    }
  }
`
