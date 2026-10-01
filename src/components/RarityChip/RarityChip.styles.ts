import styled from 'styled-components'
import type { PlantRarity } from '../../mock/types'
import { theme } from '../../theme/tokens'

export const Chip = styled.span<{ $rarity: PlantRarity }>`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  height: 22px;
  padding-inline: 8px;
  border-radius: ${theme.radii.pill};
  border: 1px solid
    ${({ $rarity }) => ($rarity === 'common' ? theme.colors.border : 'transparent')};
  background: ${({ $rarity }) =>
    $rarity === 'unique'
      ? theme.colors.growth
      : $rarity === 'rare'
        ? theme.colors.chipGreen
        : theme.colors.chipNeutral};
  color: ${({ $rarity }) => ($rarity === 'common' ? theme.colors.muted : theme.colors.forest)};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
  white-space: nowrap;
`
