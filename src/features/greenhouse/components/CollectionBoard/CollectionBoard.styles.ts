import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Board = styled.div<{ $split?: boolean }>`
  display: grid;
  gap: ${theme.space.xl};
  min-width: 0;
  align-items: start;

  ${({ $split }) =>
    $split &&
    `
    @container (min-width: 961px) {
      grid-template-columns: minmax(0, 1fr) min(300px, 32%);
    }
  `}
`

export const Shelf = styled.div`
  display: grid;
  gap: ${theme.space.lg};
  min-width: 0;
`

export const Growing = styled.section`
  display: grid;
  gap: 16px;
  min-width: 0;
`

export const GrowingHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 12px 16px;
`

export const GrowingTitle = styled.h2`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: 400;
  font-size: clamp(26px, 3vw, 34px);
  color: ${theme.colors.forest};
`

export const SearchBox = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.space.sm};
  flex: 1 1 200px;
  max-width: 280px;
  height: 40px;
  padding: 0 14px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};

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

  &:focus-within {
    border-color: ${theme.colors.forest};
    box-shadow: 0 0 0 4px ${theme.colors.chipGreen};
  }
`

export const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const Filter = styled.button<{ $on?: boolean }>`
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
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    border-color: ${theme.colors.forest};
  }
`

export const Count = styled.span`
  font-weight: 600;
  opacity: 0.78;
`

export const Empty = styled.p`
  margin: 4px 0 0;
  color: ${theme.colors.muted};
  font-size: 14px;
`
