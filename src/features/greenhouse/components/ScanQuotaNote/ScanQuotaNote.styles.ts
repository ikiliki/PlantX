import styled from 'styled-components'
import { pressable, riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

/** A small tile: spark, label + count, the day's scans as segments. Tapping shows when they reset. */
export const Root = styled.button<{ $out: boolean; $open: boolean }>`
  ${pressable}
  display: inline-grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  column-gap: 10px;
  box-sizing: border-box;
  max-width: 100%;
  min-width: min(200px, 100%);
  margin: 0;
  padding: 8px 12px 8px 8px;
  border: 1px solid ${({ $open }) => ($open ? 'rgba(59, 124, 201, 0.35)' : theme.colors.border)};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.ink};
  font: inherit;
  text-align: start;
  cursor: pointer;
  opacity: ${({ $out }) => ($out ? 0.85 : 1)};

  &:hover {
    border-color: rgba(59, 124, 201, 0.35);
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }
`

export const Spark = styled.span<{ $out: boolean }>`
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: ${theme.radii.sm};
  background: ${({ $out }) => ($out ? theme.colors.chipNeutral : 'rgba(59, 124, 201, 0.12)')};
  color: ${({ $out }) => ($out ? theme.colors.muted : theme.colors.aiBlue)};
  font-size: 15px;
  line-height: 1;
`

export const Copy = styled.span`
  display: grid;
  gap: 4px;
  min-width: 0;
`

export const Head = styled.span`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
`

export const Label = styled.span`
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.02em;
  color: ${theme.colors.muted};
  white-space: nowrap;
`

export const Count = styled.span<{ $out: boolean }>`
  font-size: 13px;
  font-weight: 750;
  color: ${({ $out }) => ($out ? theme.colors.muted : theme.colors.forest)};
  white-space: nowrap;
`

export const Segments = styled.span`
  display: flex;
  gap: 3px;
  min-width: 0;
`

export const Segment = styled.span<{ $on: boolean }>`
  flex: 1 1 0;
  min-width: 6px;
  height: 4px;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.aiBlue : theme.colors.track)};
  transition: background ${theme.motion.base} ${theme.motion.ease};
`

export const Detail = styled.span`
  grid-column: 1 / -1;
  margin-top: 8px;
  padding-top: 7px;
  border-top: 1px dashed ${theme.colors.border};
  font-size: 12px;
  font-weight: 550;
  color: ${theme.colors.muted};
  animation: ${riseIn} ${theme.motion.base} ${theme.motion.ease} both;
`
