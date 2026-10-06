import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.section`
  container-type: inline-size;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  padding: 20px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
  min-width: 0;

  h2 {
    margin: 0;
    color: ${theme.colors.forest};
    font-size: 18px;
  }
`

export const Lead = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${theme.colors.muted};
`

export const List = styled.ul`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  margin: 0;
  padding: 0;
  list-style: none;
  min-width: 0;
`

export const Item = styled.li`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  padding: 14px 0;
  border-top: 1px solid ${theme.colors.border};
  min-width: 0;

  &:first-child {
    border-top: 0;
  }

  @container (min-width: 640px) {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }
`

export const Copy = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;

  strong {
    font-size: 14px;
    color: ${theme.colors.ink};
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.45;
    color: ${theme.colors.muted};
  }
`

export const Env = styled.span<{ $set: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${({ $set }) => ($set ? theme.colors.moss : theme.colors.warn)};
  overflow-wrap: anywhere;

  &::before {
    content: '';
    flex: none;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
  }

  code {
    font-family: ui-monospace, monospace;
  }
`

export const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

export const Note = styled.p<{ $bad?: boolean }>`
  margin: 0;
  font-size: 12px;
  color: ${({ $bad }) => ($bad ? theme.colors.danger : theme.colors.muted)};
`
