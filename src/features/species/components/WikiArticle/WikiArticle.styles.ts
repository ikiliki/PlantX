import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Article = styled.article`
  display: grid;
  gap: 16px;
  min-width: 0;
`

export const Title = styled.h1`
  margin: 0;
  padding-bottom: 6px;
  border-bottom: 1px solid ${theme.colors.border};
  font-family: ${theme.fonts.display};
  font-size: clamp(32px, 4vw, 42px);
  line-height: 1.1;
  color: ${theme.colors.ink};
`

export const Scientific = styled.p`
  margin: 0;
  font-size: 16px;
  color: ${theme.colors.muted};
  em {
    font-style: italic;
  }
`

export const Layout = styled.div`
  display: grid;
  gap: 20px;
  align-items: start;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'lead'
    'rail'
    'toc'
    'body';
  @media (min-width: ${theme.breakpoints.md}) {
    grid-template-columns: minmax(0, 1fr) 280px;
    grid-template-areas:
      'lead rail'
      'toc rail'
      'body rail';
  }
`

export const Lead = styled.div`
  grid-area: lead;
  display: grid;
  gap: 8px;
  font-size: 16px;
  line-height: 1.7;
  color: ${theme.colors.ink};
  p {
    margin: 0;
  }
`

export const TocWrap = styled.div`
  grid-area: toc;
  justify-self: start;
`

export const Rail = styled.div`
  grid-area: rail;
  display: grid;
  gap: 14px;
  min-width: 0;
`

export const Body = styled.div`
  grid-area: body;
  display: grid;
  gap: 22px;
  min-width: 0;
`

export const Facts = styled.dl`
  display: grid;
  gap: 8px;
  margin: 0;
`

export const Fact = styled.div`
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 10px;
  align-items: baseline;
  dt {
    font-size: 13px;
    font-weight: 700;
    color: ${theme.colors.muted};
  }
  dd {
    margin: 0;
  }
`

export const Note = styled.p`
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 12px 14px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipGreen};
  font-size: 14px;
  line-height: 1.5;
  color: ${theme.colors.forest};
  strong {
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
`

export const Grades = styled.ul`
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
`

export const Grade = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  line-height: 1.45;
`
