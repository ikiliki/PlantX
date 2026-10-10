import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { segmentItem, segmentRow } from '../../../../components/Segmented/Segmented.styles'
import { theme } from '../../../../theme/tokens'

/** One line at every width: on a narrow screen the tabs scroll sideways instead of wrapping. */
export const Row = styled.div`
  ${segmentRow}
  display: flex;
  flex-wrap: nowrap;
  margin-bottom: ${theme.space.lg};
  max-width: 100%;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`

export const Tab = styled(Link)<{ $on?: boolean }>`
  ${segmentItem}
  flex: none;
  white-space: nowrap;
`
