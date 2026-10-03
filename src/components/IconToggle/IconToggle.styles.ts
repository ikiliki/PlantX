import styled, { css } from 'styled-components'
import { pressable } from '../../theme/motion'
import { theme } from '../../theme/tokens'

/** Centered just above the bottom nav. Shared by the greenhouse scope and the home feed. */
const floating = css`
  position: fixed;
  z-index: ${theme.z.floating};
  inset-inline: 0;
  margin-inline: auto;
  bottom: calc(${theme.layout.bottomNav} + ${theme.space.md} + env(safe-area-inset-bottom));
  width: max-content;
  padding: 3px;
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.lift};
`

export const Root = styled.div<{ $floating?: boolean; $count: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $count }) => $count}, minmax(0, 1fr));
  width: 100%;
  min-width: 0;
  gap: 2px;
  padding: 2px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipNeutral};

  ${({ $floating, $count }) =>
    $floating &&
    css`
      ${floating}
      grid-template-columns: repeat(${$count}, auto);
    `}
`

export const Btn = styled.button<{ $on?: boolean; $floating?: boolean }>`
  ${pressable}
  display: grid;
  place-items: center;
  width: 100%;
  min-width: 0;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.creamCard : 'transparent')};
  color: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.muted)};
  box-shadow: ${({ $on }) => ($on ? theme.shadow.soft : 'none')};
  cursor: pointer;

  ${({ $floating, $on }) =>
    $floating &&
    css`
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-width: 48px;
      padding: 0 ${$on ? '12px' : '0'};
    `}
`

export const Name = styled.span`
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
`
