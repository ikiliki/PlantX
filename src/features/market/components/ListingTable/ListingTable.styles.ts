import styled, { css } from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const columns = css`
  display: grid;
  grid-template-columns:
    40px
    minmax(0, 1.8fr)
    76px
    minmax(0, 0.55fr)
    minmax(0, 1fr)
    minmax(0, 1fr)
    minmax(0, 0.75fr)
    minmax(0, 0.85fr)
    minmax(0, 0.7fr);
  column-gap: 10px;
  align-items: center;
  width: 100%;

  @container (max-width: 720px) {
    grid-template-columns: 40px minmax(72px, 1.6fr) auto auto auto;
    column-gap: 8px;

    > :nth-child(4),
    > :nth-child(5),
    > :nth-child(6),
    > :nth-child(7) {
      display: none;
    }
  }
`

export const Scroll = styled.div`
  min-width: 0;
  max-width: 100%;
  container-type: inline-size;
`

export const Sheet = styled.div`
  display: grid;
  gap: 6px;
  width: 100%;
`

export const Header = styled.div<{ $inert?: boolean }>`
  ${columns};
  height: 30px;
  padding: 0 14px;
  border: 1px solid transparent;
  color: ${theme.colors.muted};
  font-size: 12px;
  font-weight: 600;
  ${({ $inert }) => $inert && 'pointer-events: none;'}
`

export const HeadCell = styled.button<{ $on?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.muted)};
  font-size: 12px;
  font-weight: ${({ $on }) => ($on ? 700 : 600)};
  text-align: start;
  cursor: pointer;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  svg {
    flex-shrink: 0;
    opacity: ${({ $on }) => ($on ? 1 : 0)};
    transition: transform 0.18s ease, opacity 0.18s ease;
  }

  &:hover {
    color: ${theme.colors.forest};
  }

  &:hover svg {
    opacity: 0.45;
  }
`
