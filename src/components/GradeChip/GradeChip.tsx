import styled from 'styled-components'
import { theme } from '../../theme/tokens'

const Chip = styled.span<{ $grade: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: ${theme.radii.sm};
  font-weight: 800;
  font-size: 13px;
  background: ${({ $grade }) =>
    $grade === 'A' ? '#D8F5E3' : $grade === 'B' ? '#FFF3CD' : $grade === 'C' ? '#FDE8E6' : '#EEF1EF'};
  color: ${({ $grade }) =>
    $grade === 'A'
      ? theme.colors.greenDark
      : $grade === 'B'
        ? '#7A5A00'
        : $grade === 'C'
          ? theme.colors.danger
          : theme.colors.muted};
`

export function GradeChip({ grade }: { grade: string }) {
  return <Chip $grade={grade}>{grade}</Chip>
}
