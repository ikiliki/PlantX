import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { segmentItem, segmentRow } from '../../../../components/Segmented/Segmented.styles'
import { theme } from '../../../../theme/tokens'

export const Row = styled.div`
  ${segmentRow}
  margin-bottom: ${theme.space.lg};
`

export const Tab = styled(Link)<{ $on?: boolean }>`
  ${segmentItem}
`
