import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { pressable } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const Board = styled.div`
  container-type: inline-size;
  width: 100%;
  min-width: 0;
`

export const BlurTape = styled.div`
  overflow: hidden;
  border-radius: ${theme.radii.lg};
  margin-block-end: ${theme.space.lg};
  pointer-events: none;

  & > div {
    margin-block-end: 0;
    filter: blur(5px);
    transform: scale(1.08);
  }
`

export const CategoriesLink = styled(Link)`
  ${pressable}
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.forest};
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: ${theme.shadow.soft};
  &:hover {
    border-color: ${theme.colors.forest};
    background: ${theme.colors.chipGreen};
  }
`

export const ResultsHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 15px;
  font-weight: 700;
  color: ${theme.colors.ink};
`
