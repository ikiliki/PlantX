import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Panel = styled.section`
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 12px;
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadow.soft};

  @container (max-width: 899px) {
    display: none;
  }
`

export const Heading = styled.h2`
  margin: 4px 4px 0;
  font-size: 22px;
  color: ${theme.colors.forest};
`

export const List = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;
`

export const Empty = styled.p`
  margin: 0 4px 4px;
  font-size: 13px;
  color: ${theme.colors.muted};
`
