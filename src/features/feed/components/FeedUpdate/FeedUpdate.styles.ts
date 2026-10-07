import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'
import type { FeedUpdateKind } from '../../../../mock/types'
import { kindInk, momentSurface } from '../ActivityMoment/ActivityMoment.styles'

const face = `
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadow.soft};
  color: inherit;
  text-decoration: none;
  transition:
    transform ${theme.motion.base} ${theme.motion.ease},
    box-shadow ${theme.motion.base} ${theme.motion.ease};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadow.lift};
  }
`

export const Card = styled.article<{ $kind: FeedUpdateKind }>`
  ${face}
  position: relative;
  overflow: hidden;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  column-gap: 10px;
  ${({ $kind }) => momentSurface($kind)}
`

export const ProfileButton = styled.button`
  position: relative;
  z-index: 1;
  grid-row: 1;
  margin: 2px 0 0;
  padding: 0;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${theme.colors.moss};
    outline-offset: 3px;
  }
`

export const Open = styled.button`
  position: relative;
  z-index: 1;
  display: grid;
  gap: 6px;
  min-width: 0;
  grid-column: 2;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
  padding-inline-end: 36px;

  article:not(:has(${ProfileButton})) & {
    grid-column: 1 / -1;
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.moss};
    outline-offset: 3px;
  }
`

export const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
`

export const Kind = styled.span<{ $kind: FeedUpdateKind }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  color: ${({ $kind }) => kindInk($kind)};
`

export const Grower = styled.span<{ $verified?: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${({ $verified }) => ($verified ? theme.colors.info : theme.colors.muted)};
`

export const Line = styled.p`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-size: clamp(17px, 4.6vw, 20px);
  line-height: 1.25;
  color: ${theme.colors.forest};
  overflow-wrap: anywhere;
`

export const When = styled.time`
  font-size: 12px;
  color: ${theme.colors.muted};
`
