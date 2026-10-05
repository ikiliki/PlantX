import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Impact = styled.div`
  padding: 12px 14px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipWarm};
  color: ${theme.colors.ink};
  font-size: 14px;
  font-weight: 650;
  line-height: 1.45;
`

export const ImpactList = styled.ul`
  margin: 6px 0 0;
  padding-inline-start: 20px;
  font-weight: 500;
`

export const ErrorText = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 650;
  color: ${theme.colors.danger};
`
