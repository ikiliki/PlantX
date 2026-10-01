import styled from 'styled-components'
import { backdropEnter, closeButton, dialogEnter, pressable, sheetBackdrop, sheetSurface } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${theme.z.dialog};
  display: grid;
  place-items: center;
  padding: ${theme.space.lg};
  background: ${theme.colors.overlay};
  ${backdropEnter}
  ${sheetBackdrop}
`

export const Dialog = styled.div`
  position: relative;
  width: min(640px, 100%);
  max-height: min(88vh, 760px);
  overflow: auto;
  padding: 28px ${theme.space.lg} 20px;
  display: grid;
  gap: ${theme.space.md};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  ${dialogEnter}
  ${sheetSurface}
`

export const Close = styled.button`
  ${closeButton}
  position: absolute;
  top: 12px;
  inset-inline-end: 12px;
`

export const Title = styled.h2`
  margin: 0 36px 20px;
  text-align: center;
  font-family: ${theme.fonts.body};
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0;
  color: ${theme.colors.ink};
`

export const Section = styled.section`
  padding: 8px 0 16px;
  & + & {
    border-top: 1px solid ${theme.colors.border};
  }
`

export const SectionTitle = styled.h3`
  margin: 8px 0 14px;
  font-family: ${theme.fonts.body};
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0;
  text-align: start;
  color: ${theme.colors.ink};
`

export const CheckGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 20px;
`

export const Check = styled.label`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  font-size: 14px;
  color: ${theme.colors.ink};
  cursor: pointer;

  input {
    width: 16px;
    height: 16px;
    accent-color: ${theme.colors.forest};
    cursor: pointer;
  }
`

export const GroupLabel = styled.p<{ $muted?: boolean }>`
  margin: 14px 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ $muted }) => ($muted ? theme.colors.muted : theme.colors.ink)};
  opacity: ${({ $muted }) => ($muted ? 0.55 : 1)};
`

export const Divider = styled.hr`
  margin: 16px 0 4px;
  border: 0;
  border-top: 1px solid ${theme.colors.border};
`

export const ChipGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
`

export const Trait = styled.button<{ $on?: boolean; $off?: boolean }>`
  ${pressable}
  min-height: 46px;
  padding: 8px 10px;
  border-radius: ${theme.radii.md};
  border: 1.5px solid
    ${({ $on, $off }) => ($off ? theme.colors.border : $on ? theme.colors.forest : theme.colors.border)};
  background: ${({ $on, $off }) =>
    $off ? theme.colors.chipNeutral : $on ? theme.colors.chipGreen : theme.colors.creamCard};
  color: ${({ $off }) => ($off ? theme.colors.muted : theme.colors.ink)};
  font-size: 14px;
  font-weight: 600;
  cursor: ${({ $off }) => ($off ? 'default' : 'pointer')};
  opacity: ${({ $off }) => ($off ? 0.45 : 1)};
  &:disabled {
    pointer-events: none;
  }
`

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid ${theme.colors.border};
`

export const Reset = styled.button`
  border: none;
  background: transparent;
  color: ${theme.colors.ink};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
`
