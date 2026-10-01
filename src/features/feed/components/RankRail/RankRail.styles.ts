import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { theme } from '../../../../theme/tokens'

export const Panel = styled.section`
  display: grid;
  gap: 10px;
  padding: 12px;
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadow.soft};
`

export const Head = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin: 4px 8px 0;
`

export const Heading = styled.h2`
  margin: 0;
  font-size: 22px;
  color: ${theme.colors.forest};
`

export const Expand = styled(Link)`
  font-size: 12px;
  font-weight: 700;
  color: ${theme.colors.forest};
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`

export const Deck = styled.div`
  display: grid;
  justify-items: center;
  min-width: 0;
  max-height: 280px;
  overflow: hidden;
  padding: 4px 0 8px;
`
