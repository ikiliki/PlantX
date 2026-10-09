import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

/** Suggestions read as "from PlantX", not as a grower's post: a tinted surface and a dashed edge. */
export const Card = styled(Link)<{ $kind: 'tip' | 'rank' | 'market' }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1.5px dashed ${theme.colors.moss};
  border-radius: ${theme.radii.lg};
  background: ${({ $kind }) => ($kind === 'tip' ? theme.colors.creamCard : theme.colors.cream)};
  color: inherit;
  text-decoration: none;

  &:focus-visible {
    outline: 3px solid ${theme.colors.growth};
    outline-offset: 2px;
  }
`

export const Thumb = styled.div`
  width: 72px;
  height: 72px;
  overflow: hidden;
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.cream};

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const Glyph = styled.div`
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.deep};
  color: ${theme.colors.growth};
`

export const Copy = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
`

export const Eyebrow = styled.span`
  font-size: ${theme.text.xs};
  font-weight: 800;
  color: ${theme.colors.moss};
`

export const Title = styled.span`
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: ${theme.text.md};
  line-height: 1.2;
  color: ${theme.colors.ink};
`

export const Body = styled.span`
  font-size: ${theme.text.sm};
  color: ${theme.colors.muted};
`

export const Action = styled.span`
  margin-top: 4px;
  font-size: ${theme.text.sm};
  font-weight: 800;
  color: ${theme.colors.forest};

  &::after {
    content: ' →';
  }
  [dir='rtl'] &::after {
    content: ' ←';
  }
`
