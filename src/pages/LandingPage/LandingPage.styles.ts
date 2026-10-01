import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Page = styled.div`
  min-height: 100%;
  overflow-x: clip;
  background: ${theme.colors.cream};
  color: ${theme.colors.ink};
`

export const HowWrap = styled.div`
  width: min(100%, 1180px);
  margin-inline: auto;
  padding: 28px ${theme.space.md} 8px;

  @media (min-width: ${theme.breakpoints.md}) {
    padding: 36px 56px 12px;
  }
`

export const Foot = styled.p`
  width: min(100%, 1180px);
  margin: 0 auto;
  padding: 0 ${theme.space.md} 40px;
  font-size: 13px;
  color: ${theme.colors.muted};

  @media (min-width: ${theme.breakpoints.md}) {
    padding: 0 56px 48px;
  }
`
