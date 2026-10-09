import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Page = styled.div`
  min-height: 100%;
  overflow-x: clip;
  background: ${theme.surface.page};
  color: ${theme.colors.ink};
`

/** The brand at the top of the page: no bar, it scrolls away with the hero. */
export const Top = styled.header`
  width: min(1240px, 100%);
  margin: 0 auto;
  padding: 24px ${theme.space.md} 0;

  @media (min-width: ${theme.breakpoints.md}) {
    padding: 32px 28px 0;
  }
`

export const Logo = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: 28px;
  letter-spacing: -0.01em;
  color: ${theme.colors.forest};
  text-decoration: none;
`

export const LogoMark = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: transform ${theme.motion.slow} ${theme.motion.spring};

  a:hover > & {
    transform: rotate(-12deg) scale(1.06);
  }
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
