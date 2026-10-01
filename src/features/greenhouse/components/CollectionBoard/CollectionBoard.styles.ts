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

    @container (max-width: 960px) {
      grid-template-columns: 1fr;
    }
  `}
`

export const Shelf = styled.div`
  display: grid;
  gap: ${theme.space.lg};
  min-width: 0;
`

export const Rail = styled.aside`
  display: grid;
  gap: 12px;
  min-width: 0;
  align-content: start;

  @container (min-width: 961px) {
    position: sticky;
    top: calc(${theme.layout.topBar} + ${theme.space.md});
    width: min(300px, 100%);
  }
`

export const Growing = styled.section`
  display: grid;
  gap: 16px;
  min-width: 0;
`

export const CareSections = styled.div`
  display: grid;
  gap: 20px;
  min-width: 0;
`

export const CareSection = styled.section`
  display: grid;
  gap: 10px;
  min-width: 0;
`

export const CareSectionHead = styled.h3`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const CareGrid = styled.div`
  display: grid;
  gap: ${theme.space.sm};
  grid-template-columns: repeat(4, minmax(0, 1fr));
  min-width: 0;

  @container (min-width: 560px) {
    gap: ${theme.space.md};
  }

  > * {
    min-width: 0;
  }
`

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px 12px;
  min-width: 0;
`

export const FilterBar = styled.div`
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
  flex-shrink: 0;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
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
