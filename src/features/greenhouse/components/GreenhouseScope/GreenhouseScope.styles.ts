import styled, { css, keyframes } from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Root = styled.div<{ $floating?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  min-width: 0;
  gap: 2px;
  padding: 2px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipNeutral};

  ${({ $floating }) =>
    $floating &&
    css`
      position: fixed;
      z-index: ${theme.z.floating};
      inset-inline-start: ${theme.space.md};
      bottom: calc(${theme.layout.bottomNav} + ${theme.space.md} + env(safe-area-inset-bottom));
      width: 104px;
      padding: 3px;
      background: ${theme.colors.creamCard};
      box-shadow: ${theme.shadow.lift};
    `}
`

export const Btn = styled.button<{ $on?: boolean }>`
  ${pressable}
  display: grid;
  place-items: center;
  width: 100%;
  min-width: 0;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.creamCard : 'transparent')};
  color: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.muted)};
  box-shadow: ${({ $on }) => ($on ? theme.shadow.soft : 'none')};
  cursor: pointer;
`

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
  inset-inline-start: ${theme.space.md};
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
