import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Section = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  min-width: 0;
  padding: 16px 18px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
`

export const Head = styled.button<{ $open?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  margin: 0;
  padding: 0 0 10px;
  border: 0;
  border-bottom: 1px solid ${({ $open }) => ($open ? theme.colors.border : 'transparent')};
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;

  h2 {
    margin: 0;
    font-family: ${theme.fonts.display};
    font-size: 20px;
    font-weight: ${theme.fonts.displayWeight};
    color: ${theme.colors.forest};
  }

  > span {
    margin-inline-start: auto;
    font-size: 12px;
    color: ${theme.colors.muted};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }
`

export const Lead = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: ${theme.colors.muted};
`

export const NoteCell = styled.span`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
`

export const Block = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;
`

export const StackText = styled.pre`
  margin: 0;
  max-height: 280px;
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 12px;
  line-height: 1.45;
  color: ${theme.colors.ink};
`
