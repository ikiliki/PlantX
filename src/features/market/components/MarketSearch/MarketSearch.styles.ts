import styled from 'styled-components'
import { menuIn, pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${theme.space.sm};
  margin-bottom: ${theme.space.md};
`

export const SearchBox = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.space.sm};
  flex: 1 1 220px;
  max-width: 280px;
  height: 40px;
  padding: 0 14px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  transition:
    border-color ${theme.motion.fast} ${theme.motion.ease},
    box-shadow ${theme.motion.base} ${theme.motion.ease},
    max-width ${theme.motion.slow} ${theme.motion.ease};

  &:hover {
    border-color: ${theme.colors.moss};
  }
  &:focus-within {
    max-width: 340px;
    border-color: ${theme.colors.forest};
    box-shadow: 0 0 0 4px ${theme.colors.chipGreen};
  }

  img {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    font-size: 14px;
    color: ${theme.colors.ink};
    &:focus,
    &:focus-visible {
      outline: none;
      box-shadow: none;
    }
    &::placeholder {
      color: ${theme.colors.muted};
    }
  }

  @media (max-width: 720px) {
    flex-basis: 100%;
    max-width: none;
    &:focus-within {
      max-width: none;
    }
  }
`

export const End = styled.div`
  margin-inline-start: auto;
  display: flex;
  align-items: center;
`

export const PillWrap = styled.div`
  position: relative;
`

export const Pill = styled.button<{ $on?: boolean }>`
  ${pressable}
  display: inline-flex;
  align-items: center;
  gap: ${theme.space.sm};
  height: 40px;
  max-width: 220px;
  padding: 0 14px;
  border-radius: ${theme.radii.pill};
  border: 1.5px solid ${({ $on }) => ($on ? theme.colors.forest : theme.colors.border)};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.ink};
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
  cursor: pointer;

  &:hover {
    border-color: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.moss)};
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  svg {
    flex-shrink: 0;
    transition: transform ${theme.motion.base} ${theme.motion.ease};
  }
  &[aria-expanded='true'] svg {
    transform: rotate(180deg);
  }
`

export const Menu = styled.div<{ $flip?: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  ${({ $flip }) => ($flip ? 'inset-inline-end: 0;' : 'inset-inline-start: 0;')}
  z-index: 30;
  width: max-content;
  min-width: 220px;
  max-width: min(320px, 80vw);
  padding: 12px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadow.card};
  animation: ${menuIn} ${theme.motion.base} ${theme.motion.ease} both;
`

export const ChoiceRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.space.sm};
`

export const Choice = styled.button<{ $on?: boolean }>`
  ${pressable}
  height: 34px;
  padding: 0 12px;
  border-radius: ${theme.radii.pill};
  border: 1px solid ${({ $on }) => ($on ? theme.colors.forest : theme.colors.border)};
  background: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.creamCard)};
  color: ${({ $on }) => ($on ? theme.colors.cream : theme.colors.ink)};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    border-color: ${theme.colors.forest};
  }
`
