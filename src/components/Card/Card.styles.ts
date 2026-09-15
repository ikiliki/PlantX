import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Card = styled.div<{ $pad?: boolean; $clickable?: boolean }>`
  background: ${theme.colors.creamCard};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadow.soft};
  border: 1px solid ${theme.colors.border};
  padding: ${({ $pad = true }) => ($pad ? theme.space.lg : 0)};
  overflow: hidden;
  ${({ $clickable }) =>
    $clickable &&
    `
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadow.card};
    }
  `}
`

export const CardMedia = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  background: ${theme.colors.forestSoft};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const CardBody = styled.div`
  padding: ${theme.space.md};
  display: grid;
  gap: 8px;
`
