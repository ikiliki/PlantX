import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { theme } from '../../../../theme/tokens'

/**
 * Full size: a clay card. The plant mosaic fills the top, the level ring sits on its lower edge, the words
 * follow. Compact (the Home rail): a single row with a small shelf under it.
 */
const face = css<{ $compact?: boolean }>`
  position: relative;
  display: grid;
  min-width: 0;
  color: inherit;
  text-decoration: none;
  background: ${theme.colors.creamCard};
  border-radius: ${theme.radii.lg};

  ${({ $compact }) =>
    $compact
      ? css`
          grid-template-columns: auto minmax(0, 1fr);
          grid-template-areas:
            'badge copy'
            'shelf shelf';
          align-items: start;
          gap: 8px 10px;
          padding: 8px 10px;
          box-shadow: ${theme.shadow.soft};

          &:hover {
            background: ${theme.colors.chipGreen};
          }
        `
      : css`
          grid-template-columns: auto minmax(0, 1fr);
          grid-template-areas:
            'shelf shelf'
            'badge copy';
          align-items: start;
          column-gap: 12px;
          padding: 8px 8px 16px;
          box-shadow: ${theme.shadow.card};
          transition:
            transform ${theme.motion.base} ${theme.motion.ease},
            box-shadow ${theme.motion.base} ${theme.motion.ease};

          &:hover {
            transform: translateY(-5px) rotate(-0.4deg);
            box-shadow: ${theme.shadow.lift};
          }

          &:hover img {
            transform: scale(1.06);
          }

          &:active {
            transform: translateY(1px) scale(0.98);
          }
        `}
`

export const CardLink = styled(Link)<{ $compact?: boolean }>`
  ${face}
`

/** The same face without a link, for the placeholder card. */
export const CardShell = styled.div<{ $compact?: boolean }>`
  ${face}
  pointer-events: none;
`

/** The level ring (or avatar). Full size: it sits on the mosaic's lower edge in a cream collar. */
export const BadgeSlot = styled.span<{ $compact?: boolean }>`
  grid-area: badge;
  display: grid;
  place-items: center;

  ${({ $compact }) =>
    !$compact &&
    css`
      position: relative;
      z-index: 1;
      margin: -26px 0 0 10px;
      padding: 4px;
      border-radius: 50%;
      background: ${theme.colors.creamCard};

      [dir='rtl'] & {
        margin: -26px 10px 0 0;
      }
    `}
`

export const Copy = styled.span<{ $stamp?: boolean }>`
  grid-area: copy;
  display: grid;
  gap: 2px;
  min-width: 0;
  padding-top: 8px;
  padding-inline-end: ${({ $stamp }) => ($stamp ? '78px' : '8px')};
`

export const NameRow = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`

export const Name = styled.span`
  flex: 1;
  min-width: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: 18px;
  line-height: 1.2;
  color: ${theme.colors.forest};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const Meta = styled.span`
  font-size: 13px;
  color: ${theme.colors.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

/** Two lines of the grower's bio, then an ellipsis. */
export const Bio = styled.span`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  margin-top: 4px;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.4;
  color: ${theme.colors.ink};
`

/** Full size: one tall photo and two stacked ones. Compact: three small tiles in a row. */
export const Shelf = styled.span<{ $compact?: boolean }>`
  grid-area: shelf;
  display: grid;
  min-width: 0;

  ${({ $compact }) =>
    $compact
      ? css`
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
        `
      : css`
          grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
          grid-template-rows: repeat(2, minmax(0, 1fr));
          gap: 6px;
          height: 176px;

          > :first-child {
            grid-row: span 2;
          }
        `}
`

const tile = css<{ $compact?: boolean }>`
  display: grid;
  place-items: center;
  height: ${({ $compact }) => ($compact ? '48px' : '100%')};
  min-width: 0;
  min-height: 0;
  border-radius: ${({ $compact }) => ($compact ? '12px' : theme.radii.md)};
  overflow: hidden;
`

export const PlantTile = styled.span<{ $compact?: boolean }>`
  ${tile}
  display: block;
  background: ${theme.colors.chipGreen};

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform ${theme.motion.slow} ${theme.motion.ease};
  }
`

export const EmptyTile = styled.span<{ $compact?: boolean }>`
  ${tile}
  border: 2px dashed ${theme.colors.border};
  background: ${theme.colors.chipNeutral};
  color: ${theme.colors.moss};
`

/** "Level 3 · Leafling" under the grower name. */
export const LevelLine = styled.span`
  font-family: ${theme.fonts.display};
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.moss};
`
