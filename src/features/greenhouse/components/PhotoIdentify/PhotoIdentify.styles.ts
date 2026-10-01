import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.div`
  display: grid;
  gap: 8px;
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
  &:disabled {
    opacity: 0.7;
    cursor: wait;
  }
`

export const Preview = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 10px;
  overflow: hidden;
  background: ${theme.colors.chipGreen};
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

export const Status = styled.p<{ $tone?: 'muted' | 'ok' | 'warn' | 'bad' }>`
  margin: 0;
  font-size: 13px;
  line-height: 1.35;
  color: ${({ $tone }) => {
    if ($tone === 'ok') return theme.colors.greenDark
    if ($tone === 'warn') return theme.colors.warn
    if ($tone === 'bad') return theme.colors.danger
    return theme.colors.muted
  }};
`
