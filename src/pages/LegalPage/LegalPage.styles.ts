import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Page = styled.main`
  min-height: 100dvh;
  background: ${theme.colors.cream};
  color: ${theme.colors.ink};
  font-family: ${theme.fonts.body};
  padding-block: 32px 64px;
  padding-inline: 16px;
`

export const Article = styled.article`
  max-inline-size: 720px;
  margin-inline: auto;
  display: grid;
  gap: 18px;
`

export const Top = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  align-items: center;
  font-size: 14px;

  a {
    color: ${theme.colors.greenDark};
    font-weight: 600;
    text-decoration: none;
  }

  a[aria-current='page'] {
    color: ${theme.colors.ink};
    text-decoration: underline;
    text-underline-offset: 4px;
  }
`

export const Title = styled.h1`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: clamp(30px, 6vw, 44px);
  line-height: 1.1;
  color: ${theme.colors.forest};
`

export const Meta = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${theme.colors.muted};
`

export const Intro = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 1.65;
`

export const Section = styled.section`
  display: grid;
  gap: 8px;

  h2 {
    margin: 8px 0 0;
    font-size: 18px;
    color: ${theme.colors.forest};
  }

  p,
  li {
    margin: 0;
    font-size: 15px;
    line-height: 1.65;
    overflow-wrap: anywhere;
  }

  ul {
    margin: 0;
    padding-inline-start: 20px;
    display: grid;
    gap: 6px;
  }

  a {
    color: ${theme.colors.greenDark};
  }
`

export const Draft = styled.p`
  margin: 12px 0 0;
  padding: 12px 14px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipWarm};
  font-size: 13px;
  color: ${theme.colors.warn};
`
