import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Panel = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${theme.space.xl};
  min-width: 0;
`

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;

  > button {
    margin-inline-start: auto;
  }
`

export const ChainLead = styled.p`
  flex: 1 1 280px;
  min-width: 0;
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: ${theme.colors.muted};
`

export const Empty = styled.p`
  margin: 0;
  padding: 18px 20px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.muted};
  font-size: 14px;
`

export const DocsLink = styled.a`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  color: ${theme.colors.forest};
  font-size: 13px;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: ${theme.colors.moss};
  }
`
