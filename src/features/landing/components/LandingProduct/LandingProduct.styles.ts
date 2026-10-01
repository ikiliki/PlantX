import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Section = styled.section`
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: 20px ${theme.space.md} 40px;
`

export const Feature = styled.div`
  display: grid;
  gap: 28px;
  align-items: center;
  background: linear-gradient(140deg, ${theme.colors.chipGreen}, ${theme.colors.cream});
  border: 1px solid ${theme.colors.border};
  border-radius: 30px;
  padding: 24px;

  @media (min-width: ${theme.breakpoints.md}) {
    grid-template-columns: 0.9fr 1.1fr;
    gap: 36px;
    padding: 34px;
  }
`

export const Kicker = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Title = styled.h2`
  margin: 12px 0 0;
  font-family: ${theme.fonts.display};
  font-weight: 400;
  font-size: clamp(32px, 4vw, 42px);
  color: ${theme.colors.forest};
`

export const Body = styled.p`
  color: ${theme.colors.muted};
  line-height: 1.65;
`

export const Checks = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 20px;
`

export const Check = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  color: ${theme.colors.ink};

  i {
    width: 22px;
    height: 22px;
    flex: none;
    border-radius: 50%;
    background: ${theme.colors.growth};
    display: grid;
    place-items: center;
    font-style: normal;
    font-size: 12px;
    color: ${theme.colors.forest};
  }
`

export const Still = styled.div`
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.card};
`
