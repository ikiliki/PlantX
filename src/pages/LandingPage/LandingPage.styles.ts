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

export const Foot = styled.footer`
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: 26px ${theme.space.md} 40px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  border-top: 1px solid ${theme.colors.border};
  font-size: 12px;
  color: ${theme.colors.muted};
`
