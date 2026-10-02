import styled from 'styled-components'
import { menuIn, pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Root = styled.div`
  position: relative;
`

export const Bell = styled.button<{ $open?: boolean }>`
  ${pressable}
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${({ $open }) => ($open ? theme.colors.chipGreen : 'transparent')};
  color: ${theme.colors.forest};
  cursor: pointer;
  box-shadow: ${({ $open }) => ($open ? `0 0 0 3px ${theme.colors.chipGreen}` : 'none')};

  &:hover {
    background: ${theme.colors.chipGreen};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 2px;
  }
`

export const Panel = styled.div`
  animation: ${menuIn} ${theme.motion.base} ${theme.motion.ease} both;
  transform-origin: top right;
  [dir='rtl'] & {
    transform-origin: top left;
  }
  position: fixed;
  top: calc(76px + env(safe-area-inset-top));
  inset-inline-end: 12px;
  width: min(360px, calc(100vw - 24px));
  z-index: ${theme.z.menu};
  container-type: inline-size;

  aside {
    width: 100%;
    height: min(62svh, 480px);
    min-height: 220px;
    max-height: min(62svh, 480px);
  }
`
