import styled from 'styled-components'
import { pressable } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const Toggle = styled.button`
  ${pressable}
  position: relative;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipWarm};
  color: ${theme.colors.forest};
  box-shadow: inset 0 -2px 0 ${theme.colors.border};
  cursor: pointer;

  &:hover {
    background: ${theme.colors.growth};
    color: ${theme.colors.deep};
  }
`

/** Sun and moon share the button: the one on screen sits upright, the other is tucked below the rim. */
export const Glyph = styled.span<{ $shown: boolean }>`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  opacity: ${({ $shown }) => ($shown ? 1 : 0)};
  transform: ${({ $shown }) => ($shown ? 'none' : 'translateY(70%) rotate(-90deg) scale(0.6)')};
  transition:
    opacity ${theme.motion.base} ${theme.motion.ease},
    transform ${theme.motion.slow} ${theme.motion.ease};
`
