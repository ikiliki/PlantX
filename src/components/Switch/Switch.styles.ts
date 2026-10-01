import styled, { keyframes } from 'styled-components'
import { theme } from '../../theme/tokens'

export const Button = styled.button<{ $on: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  max-width: 100%;
  padding-block: 4px;
  padding-inline: 6px 12px;
  border-radius: ${theme.radii.pill};
  border: 1px solid ${({ $on }) => ($on ? theme.colors.forest : theme.colors.border)};
  background: ${({ $on }) => ($on ? theme.colors.chipGreen : theme.colors.cream)};
  color: ${theme.colors.ink};
  font-size: 13px;
  font-weight: 700;
  letter-spacing: normal;
  text-align: start;
  cursor: pointer;

  &:disabled {
    cursor: default;
  }

  &[aria-busy='true'] {
    cursor: progress;
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }
`

const spin = keyframes`
  to { transform: rotate(360deg); }
`

export const Spinner = styled.span`
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  margin-inline: 10px 2px;
  border-radius: 50%;
  border: 2px solid ${theme.colors.border};
  border-top-color: ${theme.colors.forest};
  animation: ${spin} 700ms linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    border-top-color: ${theme.colors.moss};
  }
`

export const Track = styled.span<{ $on: boolean }>`
  position: relative;
  flex: 0 0 auto;
  width: 36px;
  height: 20px;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.track)};

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${({ $on }) => ($on ? theme.colors.growth : theme.colors.creamCard)};
    inset-inline-start: ${({ $on }) => ($on ? '18px' : '2px')};
    transition: inset-inline-start ${theme.motion.fast} ${theme.motion.ease};
  }
`

export const Label = styled.span`
  min-width: 0;
  overflow-wrap: anywhere;
`
