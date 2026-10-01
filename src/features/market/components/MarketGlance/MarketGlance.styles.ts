import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Strip = styled.section<{ $embedded?: boolean }>`
  display: flex;
  align-items: stretch;
  min-inline-size: 0;
  margin-block-end: ${({ $embedded }) => ($embedded ? '0' : '18px')};
  border-radius: ${({ $embedded }) => ($embedded ? theme.radii.md : theme.radii.lg)};
  border: 1px solid ${theme.colors.border};
  background: ${({ $embedded }) => ($embedded ? theme.colors.cream : theme.colors.creamCard)};
  overflow: hidden;
`

export const Label = styled(Link)`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-block: 0;
  padding-inline: 14px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
  border-inline-end: 1px solid ${theme.colors.border};
  text-decoration: none;

  &:hover {
    color: ${theme.colors.forest};
  }
`
