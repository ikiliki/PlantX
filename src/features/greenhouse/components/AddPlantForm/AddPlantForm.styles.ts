import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Form = styled.form`
  display: grid;
  gap: ${theme.space.lg};
`

export const PhotoButton = styled.button`
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: ${theme.radii.md};
  border: 1px dashed ${theme.colors.border};
  background: ${theme.colors.creamCard};
  text-align: start;
  cursor: pointer;
  color: ${theme.colors.ink};
  width: 100%;
`

export const Preview = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 10px;
  overflow: hidden;
  background: ${theme.colors.chipGreen};
`

export const CatalogMark = styled.div`
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
`

export const PhotoCopy = styled.span`
  display: grid;
  gap: 4px;
  strong {
    font-size: 14px;
  }
  small {
    font-size: 12px;
    color: ${theme.colors.muted};
  }
`

export const ClassCode = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${theme.colors.forest};
`

export const Saved = styled.p`
  font-size: 13px;
  font-weight: 700;
  color: ${theme.colors.greenDark};
`

export const SubmitRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding-top: 4px;
`
