import styled, { css } from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Wrap = styled.span<{ $corner?: boolean }>`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  vertical-align: middle;
  ${({ $corner }) =>
    $corner &&
    css`
      position: absolute;
      z-index: 2;
      inset-block-start: 6px;
      inset-inline-end: 6px;
    `}
`

export const Stamp = styled.span<{ $changed?: boolean }>`
  display: inline-grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: ${theme.radii.pill};
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
  cursor: help;
  background: ${({ $changed }) => ($changed ? 'color-mix(in srgb, var(--c-warn) 16%, transparent)' : theme.colors.aiBlue)};
  color: ${({ $changed }) => ($changed ? theme.colors.warn : '#fff')};
  outline: none;

  &:focus-visible {
    box-shadow: 0 0 0 2px ${theme.colors.creamCard}, 0 0 0 4px ${theme.colors.aiBlue};
  }
`

/** Opens under the stamp, toward the inside of the card, on hover, focus and tap. */
export const Tip = styled.span`
  position: absolute;
  z-index: 3;
  inset-block-start: calc(100% + 6px);
  inset-inline-end: -6px;
  display: grid;
  gap: 2px;
  min-width: 120px;
  max-width: 200px;
  padding: 8px 10px;
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.forest};
  color: ${theme.colors.creamCard};
  box-shadow: 0 6px 18px color-mix(in srgb, var(--c-forest) 24%, transparent);
  text-align: start;
  white-space: normal;
  opacity: 0;
  visibility: hidden;
  translate: 0 -2px;
  transition:
    opacity ${theme.motion.base} ${theme.motion.ease},
    translate ${theme.motion.base} ${theme.motion.ease},
    visibility 0s linear ${theme.motion.base};
  pointer-events: none;

  /* Little arrow toward the stamp. */
  &::before {
    content: '';
    position: absolute;
    inset-block-end: 100%;
    inset-inline-end: 10px;
    border: 5px solid transparent;
    border-block-end-color: ${theme.colors.forest};
  }

  ${Wrap}:hover > &,
  ${Wrap}:focus-within > & {
    opacity: 1;
    visibility: visible;
    translate: 0 0;
    transition-delay: 0s;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

export const TipLabel = styled.span`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: ${theme.colors.chipGreen};
`

export const TipValue = styled.span`
  font-size: 14px;
  font-weight: 800;
`
