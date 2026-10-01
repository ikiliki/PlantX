import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

export const Thumb = styled.span`
  display: block;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  overflow: hidden;
  background: ${theme.colors.chipGreen};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const Answer = styled.span`
  display: grid;
  gap: 2px;

  small {
    color: ${theme.colors.muted};
    font-size: 11px;
  }
`

export const Duration = styled.span`
  font-variant-numeric: tabular-nums;
`

/** One chip per class field: did the saved plant keep the AI answer, change it, or fill it by hand? */
export const FieldChips = styled.span`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 260px;
`

export const FieldChip = styled.span<{ $state: 'kept' | 'changed' | 'manual' }>`
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 2px 8px;
  border-radius: ${theme.radii.pill};
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  background: ${({ $state }) =>
    $state === 'kept' ? theme.colors.chipGreen : $state === 'changed' ? theme.colors.chipWarm : theme.colors.cream};
  color: ${({ $state }) =>
    $state === 'kept' ? theme.colors.forest : $state === 'changed' ? theme.colors.warn : theme.colors.muted};
  border: 1px ${({ $state }) => ($state === 'manual' ? 'dashed' : 'solid')} ${theme.colors.border};

  small {
    font-weight: 600;
    opacity: 0.8;
  }
`
