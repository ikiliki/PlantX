import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Card = styled(Link)`
  display: grid;
  grid-template-rows: 140px auto;
  min-width: 0;
  padding: 8px;
  overflow: hidden;
  border: 0;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.card};
  color: ${theme.colors.ink};
  text-decoration: none;
  transition:
    transform ${theme.motion.base} ${theme.motion.ease},
    box-shadow ${theme.motion.base} ${theme.motion.ease};
  &:hover {
    transform: translateY(-6px) rotate(-1deg);
    box-shadow: ${theme.shadow.lift};
  }
  &:active {
    transform: translateY(1px) scale(0.97);
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.moss};
    outline-offset: 2px;
  }
`

export const Photo = styled.div`
  min-height: 0;
  overflow: hidden;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipGreen};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

export const Body = styled.div`
  display: grid;
  gap: 4px;
  padding: 12px 12px 14px;
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
