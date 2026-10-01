import styled, { css } from 'styled-components'
import type { PlantIdentificationSource } from '../../../../mock/types'
import { theme } from '../../../../theme/tokens'

export const Root = styled.span<{ $source: PlantIdentificationSource; $compact?: boolean }>`
  display: inline-flex;
  justify-self: start;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  min-width: 0;
  padding: ${({ $compact }) => ($compact ? '4px 9px 4px 5px' : '8px 14px 8px 8px')};
  border-radius: ${theme.radii.pill};
  font-size: ${({ $compact }) => ($compact ? '11px' : '13px')};
  font-weight: 800;
  line-height: 1.2;

  ${({ $source }) =>
    $source === 'ai'
      ? css`
          background: ${theme.colors.forest};
          color: ${theme.colors.creamCard};
        `
      : $source === 'edited'
        ? css`
            background: ${theme.colors.chipWarm};
            color: ${theme.colors.warn};
          `
        : css`
            background: ${theme.colors.chipNeutral};
            color: ${theme.colors.warn};
            box-shadow: inset 0 0 0 1px ${theme.colors.border};
          `}

  ${({ $compact }) =>
    $compact &&
    css`
      box-shadow: ${theme.shadow.soft};
      backdrop-filter: blur(6px);
    `}
`

export const Mark = styled.span<{ $source: PlantIdentificationSource }>`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 1.7em;
  height: 1.7em;
  border-radius: ${theme.radii.pill};
  font-size: 0.9em;
  background: ${({ $source }) => ($source === 'ai' ? theme.colors.growth : 'rgba(154, 107, 31, 0.14)')};
  color: ${({ $source }) => ($source === 'ai' ? theme.colors.forest : theme.colors.warn)};
`

export const Text = styled.span`
  display: grid;
  gap: 2px;
  min-width: 0;
`

export const Detail = styled.small`
  font-size: 11px;
  font-weight: 600;
  opacity: 0.8;
`
