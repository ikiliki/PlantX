import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Card = styled(Link)`
  display: grid;
  /* A framed specimen, like the greenhouse cards: the photo sits inset in a mount. */
  grid-template-rows: auto auto;
  min-width: 0;
  padding: 6px;
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.ink};
  text-decoration: none;
  transition:
    transform ${theme.motion.base} ${theme.motion.ease},
    box-shadow ${theme.motion.base} ${theme.motion.ease};
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadow.lift};
  }
  &:hover img {
    transform: scale(1.06);
  }
  &:active {
    transform: translateY(-1px) scale(0.985);
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.moss};
    outline-offset: 2px;
  }
`

export const Photo = styled.div`
  aspect-ratio: 4 / 3;
  min-height: 0;
  overflow: hidden;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipGreen};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform ${theme.motion.slow} ${theme.motion.ease};
  }
`

export const Body = styled.div`
  display: grid;
  gap: 4px;
  padding: 12px 8px 6px;
`

export const Name = styled.strong`
  font-family: ${theme.fonts.display};
  font-size: 20px;
  font-weight: ${theme.fonts.displayWeight};
  line-height: 1.15;
  color: ${theme.colors.forest};
`

export const Scientific = styled.em`
  font-size: 12px;
  font-style: italic;
  color: ${theme.colors.muted};
`

export const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-top: 4px;
  font-size: 12px;
  color: ${theme.colors.muted};
`
