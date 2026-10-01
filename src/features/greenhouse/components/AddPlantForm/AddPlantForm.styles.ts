import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Form = styled.form`
  display: grid;
  gap: ${theme.space.lg};
`

/** Catalog icon sits at the inline end, info only. It is not a photo slot. */
export const CatalogInfo = styled.div`
  display: flex;
  justify-content: flex-end;
  min-width: 0;
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
