import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Page = styled.div`
  min-height: 100%;
  overflow-x: clip;
  background: ${theme.surface.page};
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
  padding: 32px ${theme.space.md} 48px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
  font-size: 13px;

  > strong {
    font-family: ${theme.fonts.display};
    font-weight: ${theme.fonts.displayWeight};
    font-size: 20px;
    color: ${theme.colors.forest};
  }
  color: ${theme.colors.muted};
`

export const FootLinks = styled.span`
  display: inline-flex;
  gap: 18px;

  a {
    color: ${theme.colors.forest};
    font-weight: 700;
  }

  a:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`
