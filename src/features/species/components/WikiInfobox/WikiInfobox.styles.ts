import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Box = styled.aside`
  display: grid;
  gap: 0;
  min-width: 0;
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.cream};
  font-size: 13px;
`

export const Caption = styled.p`
  margin: 0;
  padding: 8px 10px 10px;
  font-family: ${theme.fonts.display};
  font-size: 18px;
  text-align: center;
  color: ${theme.colors.ink};
`

export const Photo = styled.div`
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: ${theme.colors.chipGreen};
  & > * {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
`

export const Rows = styled.dl`
  display: grid;
  margin: 0;
  border-top: 1px solid ${theme.colors.border};
`

export const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 8px;
  align-items: start;
  padding: 7px 10px;
  border-bottom: 1px solid ${theme.colors.border};
  &:nth-child(odd) {
    background: ${theme.colors.creamCard};
  }
  &:last-child {
    border-bottom: 0;
  }
  dt {
    color: ${theme.colors.muted};
  }
  dd {
    margin: 0;
    font-weight: 600;
    color: ${theme.colors.ink};
    overflow-wrap: anywhere;
  }
`
