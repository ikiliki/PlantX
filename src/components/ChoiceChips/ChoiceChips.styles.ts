import styled, { css, keyframes } from 'styled-components'
import { pressable } from '../../theme/motion'
import { theme } from '../../theme/tokens'

const chipIn = keyframes`
  from { opacity: 0; transform: translateY(6px) scale(0.96); }
  to { opacity: 1; transform: none; }
`

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(207, 234, 120, 0); }
  50% { box-shadow: 0 0 0 4px rgba(207, 234, 120, 0.85); }
`

export const Group = styled.fieldset`
  display: grid;
  gap: 10px;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  container-type: inline-size;

  &:disabled {
    opacity: 0.55;
  }

  [role='radiogroup'] {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  [role='radiogroup'][data-layout='tiles'] {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(132px, 100%), 1fr));
    gap: 10px;
  }
`

export const Empty = styled.span`
  flex: 1 1 140px;
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 0 16px;
  font-size: 13px;
  color: ${theme.colors.muted};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.creamCard};
  box-shadow: inset 0 0 0 1px ${theme.colors.border};
`

export const MoreChip = styled.button`
  min-height: 40px;
  padding: 0 14px;
  border: 1px dashed ${theme.colors.moss};
  border-radius: ${theme.radii.pill};
  background: transparent;
  color: ${theme.colors.forest};
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.chipGreen};
  }
`

export const Legend = styled.legend`
  padding: 0;
  margin-bottom: 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Required = styled.span`
  margin-inline-start: 3px;
  color: ${theme.colors.danger};
`

export const Chip = styled.button<{ $on: boolean; $tile: boolean; $suggested: boolean }>`
  ${pressable}
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  min-width: 0;
  padding: 0 16px;
  border: 1px solid ${({ $on }) => ($on ? theme.colors.forest : theme.colors.border)};
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.creamCard)};
  color: ${({ $on }) => ($on ? theme.colors.creamCard : theme.colors.ink)};
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  text-align: start;
  cursor: pointer;
  animation: ${chipIn} ${theme.motion.base} ${theme.motion.ease} backwards;

  &:hover:not(:disabled) {
    border-color: ${theme.colors.forest};
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
  }

  ${({ $suggested, $on }) =>
    $suggested &&
    !$on &&
    css`
      border-style: dashed;
      border-color: ${theme.colors.moss};
    `}

  ${({ $suggested, $on }) =>
    $suggested &&
    $on &&
    css`
      animation:
        ${chipIn} ${theme.motion.base} ${theme.motion.ease} backwards,
        ${glow} 1.6s ${theme.motion.ease} 2;
    `}

  ${({ $tile, $on }) =>
    $tile &&
    css`
      display: grid;
      grid-template-rows: auto auto;
      align-items: start;
      gap: 0;
      padding: 0;
      overflow: hidden;
      border-radius: ${theme.radii.md};
      border-width: ${$on ? '2px' : '1px'};
      background: ${theme.colors.creamCard};
      color: ${theme.colors.ink};
      box-shadow: ${$on ? `0 0 0 3px ${theme.colors.chipGreen}` : 'none'};
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const ChipPhoto = styled.span`
  position: relative;
  display: block;
  aspect-ratio: 4 / 3;
  background: ${theme.colors.chipGreen};
  overflow: hidden;

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

/** Small round photo at the start of a chip (chips layout). */
export const ChipThumb = styled.span`
  position: relative;
  flex: none;
  width: 28px;
  height: 28px;
  margin-inline-start: -10px;
  border-radius: 50%;
  overflow: hidden;
  background: ${theme.colors.chipGreen};
  box-shadow: 0 0 0 2px ${theme.colors.creamCard};

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const ChipText = styled.span`
  display: grid;
  gap: 2px;
  min-width: 0;

  [data-layout='tiles'] & {
    padding: 10px 12px 12px;
    font-size: 13px;
    line-height: 1.25;
  }
`

export const ChipHint = styled.small`
  font-size: 11px;
  font-weight: 600;
  opacity: 0.72;
`

export const Suggested = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.growth};
  color: ${theme.colors.forest};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;

  [data-layout='tiles'] & {
    position: absolute;
    inset-block-start: 8px;
    inset-inline-end: 8px;
    box-shadow: ${theme.shadow.soft};
  }
`
