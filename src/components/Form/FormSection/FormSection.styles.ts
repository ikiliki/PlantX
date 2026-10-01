import styled from 'styled-components'
import { theme } from '../../../theme/tokens'

export const Section = styled.section`
  display: grid;
  gap: ${theme.space.md};
  padding: ${theme.space.md} ${theme.space.lg};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.cream};
  border: 1px solid ${theme.colors.border};
`

export const Head = styled.div`
  display: grid;
  gap: 4px;
`

export const Title = styled.h3`
  margin: 0;
  font-family: ${theme.fonts.body};
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
  color: ${theme.colors.ink};
`

export const Hint = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: ${theme.colors.muted};
`

export const Body = styled.div`
  display: grid;
  gap: ${theme.space.md};
`

export const Row = styled.div`
  display: grid;
  gap: ${theme.space.md};
  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
`

export const OptionGrid = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
`

export const Option = styled.button<{ $on?: boolean; $off?: boolean }>`
  min-height: 42px;
  padding: 8px 12px;
  border-radius: ${theme.radii.md};
  border: 1px solid
    ${({ $on, $off }) => ($off ? theme.colors.border : $on ? theme.colors.forest : theme.colors.border)};
  background: ${({ $on, $off }) =>
    $off ? theme.colors.chipNeutral : $on ? theme.colors.chipGreen : theme.colors.creamCard};
  color: ${({ $off }) => ($off ? theme.colors.muted : theme.colors.ink)};
  font-size: 14px;
  font-weight: 600;
  text-align: start;
  cursor: ${({ $off }) => ($off ? 'default' : 'pointer')};
  opacity: ${({ $off }) => ($off ? 0.5 : 1)};
  &:disabled {
    pointer-events: none;
  }
`
