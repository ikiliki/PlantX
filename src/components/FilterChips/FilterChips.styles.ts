import styled from 'styled-components'
import { pressable } from '../../theme/motion'
import { theme } from '../../theme/tokens'

/** Sized by the page container: full chips wide, tighter chips edge to edge on a phone. */
export const Bar = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @container (max-width: 720px) {
    gap: 6px;
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 2px;
    overscroll-behavior-x: contain;
    padding-inline-end: 2px;
  }

  @container (max-width: 559px) {
    flex-wrap: nowrap;
    gap: 4px;
    overflow-x: auto;
    box-sizing: border-box;
    width: calc(100% + 2 * ${theme.space.md});
    margin-inline: calc(-1 * ${theme.space.md});
    padding-inline: 6px;
  }
`

export const Chip = styled.button<{ $on?: boolean }>`
  ${pressable}
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid ${({ $on }) => ($on ? theme.colors.forest : theme.colors.border)};
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.creamCard)};
  color: ${({ $on }) => ($on ? theme.colors.creamCard : theme.colors.ink)};
  flex-shrink: 0;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    border-color: ${theme.colors.forest};
  }

  @container (max-width: 720px) {
    scroll-snap-align: start;
    scroll-snap-stop: always;
    min-height: 34px;
    padding: 0 12px;
    border-color: transparent;
    background: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.chipNeutral)};
    box-shadow: ${({ $on }) => ($on ? 'none' : theme.shadow.soft)};
  }

  @container (max-width: 559px) {
    flex: 0 0 auto;
    justify-content: center;
    min-height: 32px;
    padding: 0 6px;
    font-size: 11px;
    gap: 4px;
  }
`

export const Count = styled.span`
  font-weight: 600;
  opacity: 0.78;
`
