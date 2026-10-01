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

export const ModeStrip = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.forest};
`

export const ModeHint = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 400;
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
