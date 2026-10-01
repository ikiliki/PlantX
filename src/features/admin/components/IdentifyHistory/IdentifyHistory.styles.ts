import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

export const Thumb = styled.span`
  display: block;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  overflow: hidden;
  background: ${theme.colors.chipGreen};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const Answer = styled.span`
  display: grid;
  gap: 2px;

  small {
    color: ${theme.colors.muted};
    font-size: 11px;
  }
`

export const Duration = styled.span`
  font-variant-numeric: tabular-nums;
`
