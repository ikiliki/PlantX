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

  &[data-missing='true'] {
    padding: 10px 12px 12px;
    border-radius: ${theme.radii.md};
    background: ${theme.colors.chipWarm};
    box-shadow: inset 0 0 0 1.5px ${theme.colors.warn};
  }

  /* A legend sits on the fieldset edge by default; float it so it stays inside the tinted box. */
  &[data-missing='true'] > legend {
    float: inline-start;
    width: 100%;
  }

  &[data-missing='true'] > legend + * {
    clear: both;
  }

  [role='radiogroup'] {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* One sideways row: chips keep their size, the bar stays hidden, arrows page it. */
  [role='radiogroup'][data-layout='row'] {
    flex-wrap: nowrap;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    padding-block: 4px;
    margin-block: -4px;
    scroll-padding-inline: 36px;
  }

  [role='radiogroup'][data-layout='row']::-webkit-scrollbar {
    display: none;
  }

  [role='radiogroup'][data-layout='row'] > * {
    flex: none;
  }

  [role='radiogroup'][data-layout='tiles'] {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(132px, 100%), 1fr));
    gap: 10px;
  }
`

/** Holds a row and its arrows, so the arrows sit on the row's edges. */
export const Rail = styled.div`
  position: relative;
  min-width: 0;
`

export const RowArrow = styled.button<{ $side: 'start' | 'end' }>`
  ${pressable}
  position: absolute;
  z-index: 1;
  inset-block-start: 50%;
  ${({ $side }) => ($side === 'start' ? 'inset-inline-start: 0;' : 'inset-inline-end: 0;')}
  translate: 0 -50%;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  box-shadow: 0 2px 8px rgba(18, 60, 45, 0.16);
  color: ${theme.colors.forest};
  font: inherit;
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.chipGreen};
  }

  /* The glyphs point along the reading direction. */
  [dir='rtl'] & > span {
    display: inline-block;
    scale: -1 1;
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

export const MissingNote = styled.span`
  margin-inline-start: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: none;
  color: ${theme.colors.warn};
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

export const Tip = styled.button<{ $above: boolean }>`
  position: fixed;
  z-index: ${theme.z.dialogTop};
  width: max-content;
  max-width: 168px;
  margin: 0;
  padding: 6px 8px;
  border: 0;
  border-radius: 8px;
  background: ${theme.colors.ink};
  color: ${theme.colors.cream};
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.35;
  text-align: start;
  white-space: pre-line;
  cursor: pointer;
  box-shadow: ${theme.shadow.lift};

  &::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    height: 12px;
    ${({ $above }) => ($above ? 'top: 100%;' : 'bottom: 100%;')}
  }
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
