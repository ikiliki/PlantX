import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Section = styled.section`
  container-type: inline-size;
  width: min(100%, 1180px);
  margin-inline: auto;
  padding: 28px ${theme.space.md} 48px;
  scroll-margin-top: 80px;

  @media (min-width: ${theme.breakpoints.md}) {
    padding: 36px 56px 64px;
  }
`

export const Stack = styled.div`
  display: grid;
  gap: 36px;
`

export const Feature = styled.article`
  display: grid;
  gap: 16px;
  align-items: center;
  min-width: 0;

  @container (min-width: 760px) {
    grid-template-columns: minmax(220px, 0.78fr) minmax(0, 1.22fr);
    gap: 32px;
  }
`

export const Title = styled.h2`
  font-size: clamp(28px, 5cqw, 40px);
  color: ${theme.colors.ink};
`

export const Body = styled.p`
  margin-top: 8px;
  max-width: 42ch;
  font-size: 16px;
  line-height: 1.5;
  color: ${theme.colors.muted};
`

export const Shot = styled.div`
  width: 100%;
  min-height: 220px;
  aspect-ratio: 16 / 10;
  border-radius: ${theme.radii.lg};
  border: 1px dashed ${theme.colors.border};
  background: ${theme.colors.creamCard};
`
