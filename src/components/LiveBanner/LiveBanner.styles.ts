import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px 16px;
  padding: 10px ${theme.space.md};
  background: ${theme.colors.chipWarm};
  border-bottom: 1px solid ${theme.colors.border};
  color: ${theme.colors.ink};
  font-size: 13px;
  line-height: 1.4;
  text-align: center;
`

export const Text = styled.p`
  margin: 0;
`

export const Retry = styled.button`
  margin: 0;
  padding: 6px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.forest};
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    border-color: ${theme.colors.moss};
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 2px;
  }
`
