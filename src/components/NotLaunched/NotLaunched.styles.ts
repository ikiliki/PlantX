import styled, { keyframes } from 'styled-components'
import { theme } from '../../theme/tokens'

export const Rooms = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  width: 100%;
`

export const Room = styled.button<{ $on: boolean }>`
  min-height: 40px;
  padding: 0 14px;
  border-radius: ${theme.radii.pill};
  border: 1px solid ${(p) => (p.$on ? theme.colors.forest : theme.colors.border)};
  background: ${(p) => (p.$on ? theme.colors.forest : theme.colors.cream)};
  color: ${(p) => (p.$on ? theme.colors.cream : theme.colors.forest)};
  font: inherit;
  font-size: 14px;
  font-weight: 650;
  cursor: pointer;
  transition: background ${theme.motion.fast} ${theme.motion.ease}, color ${theme.motion.fast} ${theme.motion.ease},
    transform ${theme.motion.fast} ${theme.motion.ease};

  &:hover {
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }
`

const lineIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
`

export const Line = styled.p`
  margin: 0;
  min-height: 1.5em;
  font-size: 14px;
  color: ${theme.colors.forestMid};
  animation: ${lineIn} ${theme.motion.base} ${theme.motion.ease} both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`
