import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Page = styled.div`
  min-height: 100%;
  overflow-x: clip;
  background: ${theme.colors.cream};
  color: ${theme.colors.ink};
`

/** Landing sections size from this container (`@container landing`), not the viewport. */
export const Main = styled.main`
  container: landing / inline-size;
  min-width: 0;
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
