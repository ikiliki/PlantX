import styled, { css } from 'styled-components'
import { theme } from '../../theme/tokens'

export const Card = styled.div<{ $pad?: boolean; $clickable?: boolean }>`
  background: ${theme.colors.creamCard};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadow.soft};
  border: 1px solid ${theme.colors.border};
  padding: ${({ $pad = true }) => ($pad ? '20px' : '0')};
  overflow: hidden;
  ${({ $clickable }) =>
    $clickable &&
    css`
      cursor: pointer;
      transition:
        transform ${theme.motion.base} ${theme.motion.ease},
        box-shadow ${theme.motion.base} ${theme.motion.ease},
        border-color ${theme.motion.base} ${theme.motion.ease};
      &:hover {
        transform: translateY(-3px);
        box-shadow: ${theme.shadow.lift};
        border-color: ${theme.colors.chipGreen};
      }
      &:active {
        transform: translateY(-1px);
      }
    `}
`

export const CardMedia = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  background: ${theme.colors.chipGreen};
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform ${theme.motion.slow} ${theme.motion.ease};
  }
  *:hover > & img {
    transform: scale(1.04);
  }
`

export const CardBody = styled.div`
  padding: ${theme.space.md};
  display: grid;
  gap: ${theme.space.sm};
`
