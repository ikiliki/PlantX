import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Shell = styled.div`
  container-type: inline-size;
  width: 100%;
  min-width: 0;
`

export const Widget = styled.div`
  display: grid;
  gap: 16px;
  width: 100%;
  min-width: 0;
`

export const Layout = styled.div`
  display: grid;
  gap: 20px;
  align-items: start;
  width: min(100%, 1320px);
  margin-inline: auto;

  @container (max-width: 899px) {
    > aside:first-child {
      display: none;
    }
  }

  @container (min-width: 900px) {
    grid-template-columns: 240px minmax(0, 1fr);
  }

  @container (min-width: 900px) and (max-width: 1179px) {
    > aside:last-child {
      grid-column: 1 / -1;
    }
  }

  @container (min-width: 1180px) {
    grid-template-columns: 250px minmax(0, 680px) 320px;
    justify-content: center;
  }
`

/** Left-rail lure. Phones do not show it until there is room. */
export const RailLure = styled.div`
  @container (max-width: 899px) {
    display: none;
  }
`

export const Rail = styled.aside`
  display: grid;
  gap: 16px;
  min-width: 0;

  @container (min-width: 1180px) {
    position: sticky;
    top: calc(${theme.layout.topBar} + ${theme.space.md});
  }

  @container (max-width: 1179px) {
    > [data-todo-rail] {
      display: none;
    }
  }

  @container (max-width: 899px) {
    > [data-wiki-rail] {
      display: none;
    }
  }
`

export const Feed = styled.div`
  display: grid;
  gap: 16px;
  min-width: 0;
`

export const Empty = styled.p`
  margin: 0;
  padding: 28px 20px;
  text-align: center;
  color: ${theme.colors.muted};
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
`

/** Feed filter chips with the refresh icon at the end of the same row. */
/** Above the feed: how fresh it is on the start side, Refresh at the end. */
export const FeedTools = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 4px 4px 4px 8px;
`

export const FeedStatus = styled.span<{ $done: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: ${theme.text.sm};
  font-weight: 600;
  color: ${({ $done }) => ($done ? theme.colors.forest : theme.colors.muted)};
  transition: color ${theme.motion.base} ${theme.motion.ease};

  /* A small live dot: lime once it has just checked, quiet otherwise. */
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ $done }) => ($done ? theme.colors.growth : theme.colors.borderStrong)};
    box-shadow: ${({ $done }) => ($done ? `0 0 0 4px ${theme.colors.chipGreen}` : 'none')};
    transition:
      background ${theme.motion.base} ${theme.motion.ease},
      box-shadow ${theme.motion.base} ${theme.motion.ease};
  }
`
