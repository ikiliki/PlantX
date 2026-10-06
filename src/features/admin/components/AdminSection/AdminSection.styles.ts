import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  min-width: 0;
  padding: 18px 20px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
`

export const Head = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${theme.colors.border};

  h2 {
    margin: 0;
    font-family: ${theme.fonts.display};
    font-size: 20px;
    font-weight: ${theme.fonts.displayWeight};
    color: ${theme.colors.forest};
  }
`

export const Copy = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
`

export const Lead = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: ${theme.colors.muted};
`

export const Aside = styled.div`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${theme.colors.muted};
`
