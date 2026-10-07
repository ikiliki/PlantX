import styled from 'styled-components'
import { riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'
import { columns } from '../ListingTable/ListingTable.styles'

export const Row = styled.button<{ $selected?: boolean; $masked?: boolean; $static?: boolean }>`
  ${columns};
  padding: ${theme.space.sm} 14px;
  border-radius: ${theme.radii.md};
  border: 1px solid ${({ $selected }) => ($selected ? theme.colors.forest : theme.colors.border)};
  background: ${({ $selected }) => ($selected ? theme.colors.chipGreen : theme.colors.creamCard)};
  box-shadow: ${({ $selected }) => ($selected ? theme.shadow.soft : 'none')};
  color: ${theme.colors.ink};
  font: inherit;
  text-align: start;
  cursor: ${({ $static }) => ($static ? 'default' : 'pointer')};
  animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards;
  transition:
    border-color ${theme.motion.fast} ${theme.motion.ease},
    box-shadow ${theme.motion.base} ${theme.motion.ease},
    transform ${theme.motion.base} ${theme.motion.ease};
  ${Array.from({ length: 10 }, (_, i) => `&:nth-child(${i + 2}) { animation-delay: ${i * 35}ms; }`).join('\n')}

  ${({ $static, $selected }) =>
    !$static &&
    `
    &:hover {
      border-color: ${$selected ? theme.colors.forest : theme.colors.moss};
      background: ${$selected ? theme.colors.chipGreen : 'rgba(228, 235, 216, 0.45)'};
    }
    &:active {
      transform: scale(0.995);
    }
  `}

  ${({ $masked }) =>
    $masked &&
    `
    filter: blur(5px);
    user-select: none;
  `}
`

export const Thumb = styled.div<{ $stale?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: ${theme.radii.md};
  overflow: hidden;
  background: ${theme.colors.chipGreen};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    ${({ $stale }) =>
      $stale &&
      `
      filter: grayscale(1);
      opacity: 0.7;
    `}
  }
`

export const NameCell = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

export const Name = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 700;

  @container (max-width: 720px) {
    overflow: visible;
    text-overflow: unset;
    white-space: normal;
    overflow-wrap: break-word;
  }
`

export const Pending = styled.span`
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${theme.colors.chipWarm};
  color: ${theme.colors.warn};
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
`

export const Health = styled.span<{ $health: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  width: fit-content;
  max-width: 100%;
  height: 24px;
  padding: 0 8px 0 6px;
  border-radius: ${theme.radii.pill};
  font-size: 12px;
  font-weight: 800;
  background: ${({ $health }) =>
    $health === 'S'
      ? theme.colors.forest
      : $health === 'A'
        ? theme.colors.chipGreen
        : $health === 'B'
          ? theme.colors.chipWarm
          : $health === 'D'
            ? '#E8DDD6'
            : theme.colors.chipDanger};
  color: ${({ $health }) =>
    $health === 'S'
      ? theme.colors.cream
      : $health === 'A'
        ? theme.colors.forest
        : $health === 'B'
          ? theme.colors.warn
          : $health === 'D'
            ? theme.colors.muted
            : theme.colors.danger};

  svg {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }
`

export const Cell = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: ${theme.colors.ink};
`

export const Price = styled(Cell)`
  font-family: ${theme.fonts.display};
  font-size: 17px;
  font-weight: ${theme.fonts.displayWeight};
  font-variant-numeric: tabular-nums;
  color: ${theme.colors.forest};
`

export const Change = styled(Cell)<{ $up: boolean }>`
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${({ $up }) => ($up ? theme.colors.greenDark : theme.colors.danger)};
`
