import styled, { css } from 'styled-components'
import type { PlantIdentificationSource } from '../../../../mock/types'
import { theme } from '../../../../theme/tokens'

/** Holds the identity chip and, when an AI plant was also hand-edited, a second "Manually edited" tag. */
export const Row = styled.span`
  display: inline-flex;
  justify-self: start;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  min-width: 0;
`

export const EditedTag = styled.span<{ $compact?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  padding: ${({ $compact }) => ($compact ? '3px 8px' : '6px 11px')};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipWarm};
  color: ${theme.colors.warn};
  font-size: ${({ $compact }) => ($compact ? '10px' : '12px')};
  font-weight: 800;
  line-height: 1.2;
  ${({ $compact }) =>
    $compact &&
    css`
      box-shadow: ${theme.shadow.soft};
      backdrop-filter: blur(6px);
    `}
`

export const Root = styled.span<{ $source: PlantIdentificationSource; $compact?: boolean }>`
  display: inline-flex;
  justify-self: start;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  min-width: 0;
  padding: ${({ $compact }) => ($compact ? '3px 8px' : '8px 14px 8px 8px')};
  border-radius: ${theme.radii.pill};
  font-size: ${({ $compact }) => ($compact ? '10px' : '13px')};
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

  /* AI named it, but the catalog has no class: not the green verified look. */
  &[data-not-in-catalog='true'] {
    background: ${theme.colors.info};
    color: ${theme.colors.creamCard};
  }

  &[data-not-in-catalog='true'] > span[aria-hidden] {
    background: color-mix(in srgb, var(--c-creamCard) 20%, transparent);
    color: ${theme.colors.creamCard};
  }

  ${({ $compact }) =>
    $compact &&
    css`
      gap: 5px;
      box-shadow: ${theme.shadow.soft};
      backdrop-filter: blur(6px);
    `}

  /* Compact AI chip: the passport's blue ✦, the same height as the Edited and Manual chips. */
  ${({ $compact, $source }) =>
    $compact &&
    $source === 'ai' &&
    css`
      background: ${theme.colors.aiBlue};
      color: var(--c-creamCard);
    `}

  /* In a chip the glyph sits in the text line, so every chip is the same height. */
  ${({ $compact }) =>
    $compact &&
    css`
      & > span[aria-hidden] {
        width: auto;
        height: auto;
        background: none;
        color: inherit;
        font-size: 1em;
      }
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
  background: ${({ $source }) => ($source === 'ai' ? theme.colors.growth : 'color-mix(in srgb, var(--c-warn) 14%, transparent)')};
  color: ${({ $source }) => ($source === 'ai' ? theme.colors.onGrowth : theme.colors.warn)};
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
