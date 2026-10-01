import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Root = styled.div<{ $shown: boolean; $delay: number }>`
  display: grid;
  min-width: 0;
  opacity: ${({ $shown }) => ($shown ? 1 : 0)};
  transform: ${({ $shown }) => ($shown ? 'none' : 'translateY(16px)')};
  transition:
    opacity ${theme.motion.slow} ${theme.motion.ease},
    transform ${theme.motion.slow} ${theme.motion.ease};
  transition-delay: ${({ $delay }) => $delay}ms;
  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    transform: none;
  }
`
