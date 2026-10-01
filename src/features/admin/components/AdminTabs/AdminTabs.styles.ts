import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { segmentItem, segmentRow } from '../../../../components/Segmented/Segmented.styles'
import { theme } from '../../../../theme/tokens'

export const Row = styled.div`
  ${segmentRow}
  margin-bottom: ${theme.space.lg};
  width: 100%;

  @media (max-width: ${theme.breakpoints.md}) {
    display: flex;
    flex-wrap: wrap;
  }
`

export const Tab = styled(Link)<{ $on?: boolean }>`
  ${segmentItem}
  @media (max-width: ${theme.breakpoints.md}) {
    flex: 1 1 auto;
    justify-content: center;
    min-width: 0;
    height: auto;
    min-height: 34px;
    padding: 6px 10px;
    text-align: center;
    white-space: normal;
  }
`
