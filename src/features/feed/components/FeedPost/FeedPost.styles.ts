import { Link } from 'react-router-dom'
import styled from 'styled-components'
import type { FeedUpdateKind } from '../../../../mock/types'
import { theme } from '../../../../theme/tokens'
import { kindInk } from '../ActivityMoment/ActivityMoment.styles'

export const Card = styled.article`
  display: grid;
  gap: 10px;
  min-width: 0;
  padding: 12px;
  background: ${theme.colors.creamCard};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadow.card};
`

export const Head = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding-inline: 2px;
`

export const ProfileButton = styled.button`
  display: grid;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: none;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 2px;
  }
`

export const Who = styled.div`
  display: grid;
  gap: 1px;
  min-width: 0;
`

export const Grower = styled.span<{ $verified?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: ${theme.text.sm};
  font-weight: 800;
  color: ${({ $verified }) => ($verified ? theme.colors.info : theme.colors.ink)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const Kind = styled.span<{ $kind: FeedUpdateKind }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: ${theme.text.xs};
  font-weight: 700;
  color: ${({ $kind }) => kindInk($kind)};

  time {
    font-weight: 600;
    color: ${theme.colors.muted};
  }
`

/** The plant photo, edge to edge in the card, square so a scroll of posts keeps one rhythm. */
export const Photo = styled.button`
  display: block;
  width: 100%;
  max-width: 100%;
  aspect-ratio: 1;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.cream};
  cursor: zoom-in;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.growth};
    outline-offset: 2px;
  }
`

export const Foot = styled.div`
  display: grid;
  gap: 2px;
  padding-inline: 4px;
`

export const PlantTitle = styled.h3`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: ${theme.text.md};
  color: ${theme.colors.ink};
  overflow-wrap: anywhere;
`

export const Caption = styled.p`
  margin: 0;
  font-size: ${theme.text.base};
  line-height: 1.45;
  color: ${theme.colors.ink};
  overflow-wrap: anywhere;
`

export const PassportLink = styled(Link)`
  justify-self: start;
  margin-top: 4px;
  font-size: ${theme.text.sm};
  font-weight: 800;
  color: ${theme.colors.forest};
  text-decoration: none;

  &::after {
    content: ' →';
  }
  [dir='rtl'] &::after {
    content: ' ←';
  }
`

export const PhotoSkeleton = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipGreen};
`
