import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { pressable } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const Board = styled.div`
  container-type: inline-size;
  width: 100%;
  min-width: 0;
`

export const BlurTape = styled.div`
  overflow: hidden;
  border-radius: ${theme.radii.lg};
  margin-block-end: ${theme.space.lg};
  pointer-events: none;

  & > div {
    margin-block-end: 0;
    filter: blur(5px);
    transform: scale(1.08);
  }
`

export const CategoriesLink = styled(Link)`
  ${pressable}
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.forest};
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: ${theme.shadow.soft};
  &:hover {
    border-color: ${theme.colors.forest};
    background: ${theme.colors.chipGreen};
  }
`

export const Stage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  min-width: 0;

  @container (min-width: 960px) {
    flex-direction: row;
    align-items: flex-start;
  }
`

export const Results = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  display: grid;
  gap: 12px;
  align-content: start;
`

export const ResultsHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 15px;
  font-weight: 700;
  color: ${theme.colors.ink};
`

export const MapPane = styled.div<{ $open: boolean }>`
  order: -1;
  overflow: hidden;
  min-width: 0;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  max-height: ${({ $open }) => ($open ? '420px' : '0px')};
  margin-bottom: ${({ $open }) => ($open ? '16px' : '0')};
  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
  transition:
    max-height 0.32s ease,
    opacity 0.22s ease,
    margin 0.32s ease,
    flex 0.32s ease;

  @container (min-width: 960px) {
    order: 0;
    position: sticky;
    top: calc(${theme.layout.topBar} + 12px);
    flex: ${({ $open }) => ($open ? '0 0 34%' : '0 0 0%')};
    min-width: ${({ $open }) => ($open ? '280px' : '0')};
    max-width: ${({ $open }) => ($open ? '420px' : '0')};
    height: ${({ $open }) => ($open ? 'calc(100svh - 150px)' : '0px')};
    max-height: ${({ $open }) => ($open ? 'calc(100svh - 150px)' : '0px')};
    margin-bottom: 0;
    margin-inline-start: ${({ $open }) => ($open ? '16px' : '0')};
  }
`
