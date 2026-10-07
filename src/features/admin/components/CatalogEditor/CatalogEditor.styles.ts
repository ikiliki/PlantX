import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Shell = styled.div`
  display: grid;
  gap: 28px;
`

export const Section = styled.section`
  display: grid;
  gap: 14px;
  padding: 22px 24px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
`

export const SectionHead = styled.header`
  display: grid;
  gap: 4px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${theme.colors.border};

  h2 {
    margin: 0;
    font-family: ${theme.fonts.display};
    font-weight: ${theme.fonts.displayWeight};
    font-size: 22px;
    color: ${theme.colors.forest};
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.45;
    color: ${theme.colors.muted};
  }
`

export const HeadRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
`

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th,
  td {
    padding: 12px 10px;
    text-align: start;
    border-bottom: 1px solid ${theme.colors.border};
    vertical-align: middle;
  }

  th {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: ${theme.type.labelTracking};
    text-transform: ${theme.type.labelCase};
    color: ${theme.colors.moss};
  }

  tr:last-child td {
    border-bottom: 0;
  }

  tbody tr[data-openable='true'] {
    cursor: pointer;
  }
`

export const NameCell = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;

  strong {
    font-weight: 700;
    color: ${theme.colors.ink};
  }

  span {
    font-size: 12px;
    color: ${theme.colors.muted};
  }
`

export const Thumb = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${theme.radii.sm};
  overflow: hidden;
  background: ${theme.colors.chipNeutral};
  flex-shrink: 0;

  img,
  picture {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const RowMain = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`

export const Select = styled.select`
  appearance: none;
  min-width: 180px;
  min-height: 36px;
  padding: 6px 28px 6px 12px;
  border-radius: ${theme.radii.sm};
  border: 1px solid ${theme.colors.border};
  background:
    linear-gradient(45deg, transparent 50%, ${theme.colors.moss} 50%) calc(100% - 14px) / 5px 5px no-repeat,
    linear-gradient(135deg, ${theme.colors.moss} 50%, transparent 50%) calc(100% - 9px) / 5px 5px no-repeat,
    ${theme.colors.cream};
  color: ${theme.colors.ink};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const Scope = styled.label`
  display: grid;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  color: ${theme.colors.moss};
`

export const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
`

export const Action = styled.button<{ $active?: boolean }>`
  min-height: 32px;
  padding: 0 12px;
  border-radius: ${theme.radii.sm};
  border: 1px solid ${({ $active }) => ($active ? theme.colors.forest : theme.colors.border)};
  background: ${({ $active }) => ($active ? theme.colors.chipGreen : theme.colors.cream)};
  color: ${theme.colors.forest};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.chipGreen};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

export const PrimaryAction = styled(Action)`
  border-color: ${theme.colors.forest};
  background: ${theme.colors.forest};
  color: ${theme.colors.cream};

  &:hover {
    background: ${theme.colors.forestMid};
  }
`

export const DetailCell = styled.td`
  && {
    padding: 0 10px 16px;
    background: ${theme.colors.cream};
  }
`

export const PropertyPanel = styled.div`
  display: grid;
  gap: 12px;
  padding: 14px;
  border-radius: ${theme.radii.md};
  border: 1px dashed ${theme.colors.border};
  background: ${theme.colors.creamCard};
`

export const PanelTitle = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;

  strong {
    font-size: 15px;
    font-weight: 700;
    color: ${theme.colors.forest};
  }

  span {
    font-size: 12px;
    line-height: 1.4;
    color: ${theme.colors.muted};
  }
`

export const Empty = styled.p`
  margin: 0;
  padding: 8px 0;
  font-size: 13px;
  color: ${theme.colors.muted};
`

export const FieldError = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.danger};
`

export const Check = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.ink};
  cursor: pointer;
`

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
`

export const Lead = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: ${theme.colors.muted};
`

export const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const Chip = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  height: 32px;
  padding: 0 10px;
  border-radius: ${theme.radii.pill};
  border: 1px solid ${({ $active }) => ($active ? theme.colors.forest : theme.colors.border)};
  background: ${({ $active }) => ($active ? theme.colors.chipGreen : theme.colors.cream)};
  font-size: 12px;
  font-weight: 700;
  color: ${theme.colors.forest};
  cursor: pointer;
  text-align: start;
`

export const AddChip = styled(Chip)`
  border-style: dashed;
  background: transparent;
  color: ${theme.colors.muted};
`
