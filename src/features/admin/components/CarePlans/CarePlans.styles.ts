import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.div`
  container-type: inline-size;
  display: grid;
  gap: 20px;
  min-width: 0;
`

export const Lead = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${theme.colors.muted};
`

export const Section = styled.section`
  display: grid;
  gap: 10px;
  min-width: 0;
`

export const SectionHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;

  h3,
  h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 800;
    color: ${theme.colors.ink};
  }
  h4 {
    font-size: 13px;
  }
  input[type='search'] {
    width: min(260px, 100%);
  }
`

/** Rows of tasks or rules: the table scrolls sideways on a narrow screen instead of squeezing. */
export const RuleTable = styled.table`
  display: block;
  width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  font-size: 13px;

  tbody {
    display: table;
    width: 100%;
  }
  td {
    padding: 8px 10px;
    border-top: 1px solid ${theme.colors.border};
    color: ${theme.colors.ink};
    white-space: nowrap;
    vertical-align: middle;
  }
  tr:first-child td {
    border-top: 0;
  }
  td:last-child {
    text-align: end;
  }
`

export const TaskName = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
`

export const Muted = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${theme.colors.muted};
`

/** AI / Yours on a rule. */
export const Source = styled.span<{ $ai?: boolean }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: ${theme.radii.pill};
  background: ${({ $ai }) => ($ai ? theme.colors.chipAi : theme.colors.chipGreen)};
  color: ${({ $ai }) => ($ai ? theme.colors.aiBlue : theme.colors.forest)};
  font-size: 11px;
  font-weight: 800;
`

export const CategoryItem = styled.div`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.creamCard};
  min-width: 0;
`

export const CategoryHead = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
  padding: 8px 12px;
  border: 0;
  background: transparent;
  color: ${theme.colors.ink};
  font: inherit;
  text-align: start;
  cursor: pointer;

  strong {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: -2px;
  }
`

/** The category's tasks at a glance: icon and days. */
export const Chips = styled.span`
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;

  @container (max-width: 520px) {
    display: none;
  }
`

export const Chip = styled.span<{ $optional?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border: 1px ${({ $optional }) => ($optional ? 'dashed' : 'solid')} ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  font-size: 11px;
  font-weight: 700;
  color: ${theme.colors.muted};
`

export const CategoryBody = styled.div`
  display: grid;
  gap: 12px;
  padding: 4px 12px 12px;
  border-top: 1px solid ${theme.colors.border};
`

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
`

export const Error = styled.span`
  font-size: 13px;
  color: ${theme.colors.danger};
`

export const IconRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

export const IconPick = styled.button<{ $on: boolean }>`
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 2px solid ${({ $on }) => ($on ? theme.colors.forest : theme.colors.border)};
  border-radius: ${theme.radii.md};
  background: ${({ $on }) => ($on ? theme.colors.chipGreen : 'transparent')};
  cursor: pointer;
`

export const LinkList = styled.div`
  display: grid;
  gap: 4px;
`

export const LinkRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto auto;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: ${theme.colors.ink};

  > span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`
