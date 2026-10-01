import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Img = styled.img<{ $loaded: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: ${theme.colors.forestSoft};
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  transition:
    opacity ${theme.motion.slow} ${theme.motion.ease},
    transform ${theme.motion.slow} ${theme.motion.ease};
`
