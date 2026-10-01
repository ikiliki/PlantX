import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Band = styled.section`
  container-type: inline-size;
  min-width: 0;
  scroll-margin-top: 80px;
  color: ${theme.colors.ink};
`

export const Inner = styled.div`
  width: min(100%, 1180px);
  margin-inline: auto;
`

export const Head = styled.header`
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
`

export const Eyebrow = styled.p`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Title = styled.h2`
  font-size: clamp(22px, 3cqi, 32px);
  max-width: 18em;
  color: ${theme.colors.forest};
`

export const Steps = styled.ol`
  display: grid;
  gap: 18px;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: how;

  @container (min-width: 520px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }
`

export const Step = styled.li`
  display: grid;
  gap: 10px;
  min-width: 0;
  align-content: start;
  counter-increment: how;
`

export const Photo = styled.div`
  height: 112px;
  border-radius: 16px;
  overflow: hidden;
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
`

export const Index = styled.span`
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.growth};
  color: ${theme.colors.forest};
  font-size: 14px;
  font-weight: 800;

  &::before {
    content: counter(how, decimal-leading-zero);
  }
`

export const Name = styled.h3`
  font-size: 24px;
  color: ${theme.colors.forest};
`

export const Body = styled.p`
  font-size: 14px;
  line-height: 1.55;
  color: ${theme.colors.muted};
`
