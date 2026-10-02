import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Box = styled.nav`
  display: grid;
  gap: 8px;
  width: max-content;
  max-width: min(100%, 280px);
  min-width: 220px;
  padding: 10px 14px 12px;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.cream};
  font-size: 13px;
`

export const Head = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
`

export const Title = styled.p`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: ${theme.colors.ink};
`

export const Toggle = styled.button`
  appearance: none;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 13px;
  color: ${theme.colors.muted};
  cursor: pointer;
`

export const List = styled.ol`
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0;
  padding-inline-start: 1.3em;
  font-size: 14px;
  line-height: 1.45;
  &[hidden] {
    display: none;
  }
`

export const Item = styled.li`
  color: ${theme.colors.ink};
`

export const Jump = styled.button`
  appearance: none;
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  color: ${theme.colors.forest};
  text-align: start;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`

export const Hint = styled.span`
  font-size: 13px;
  color: ${theme.colors.muted};
  text-decoration: none;
`

export const JumpLink = styled(Link)`
  color: ${theme.colors.forest};
  &:hover {
    text-decoration: underline;
  }
`
