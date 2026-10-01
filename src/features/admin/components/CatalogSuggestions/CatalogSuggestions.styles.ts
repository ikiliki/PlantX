import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Box = styled.section`
  display: grid;
  gap: 8px;
  margin: 0 0 16px;
  padding: 12px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipWarm};
  color: ${theme.colors.ink};
  text-align: start;
`

export const Head = styled.div`
  display: grid;
  gap: 2px;

  strong {
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${theme.colors.warn};
  }

  p {
    margin: 0;
    color: ${theme.colors.muted};
    font-size: 13px;
    line-height: 1.4;
  }
`

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  padding: 8px 0;
  border-top: 1px solid ${theme.colors.border};
`

export const Name = styled.div`
  flex: 1 1 180px;
  min-width: 0;

  strong {
    display: block;
  }

  small {
    color: ${theme.colors.muted};
  }
`

export const Hits = styled.span`
  color: ${theme.colors.muted};
  font-size: 12px;
`

export const Actions = styled.div`
  display: flex;
  gap: 8px;
`
