import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Wrap = styled.section`
  width: min(1180px, 100%);
  margin: 0 auto 72px;
  padding: 0 ${theme.space.md};
`

export const Box = styled.div`
  display: grid;
  gap: 28px;
  align-items: center;
  background: ${theme.colors.forest};
  color: ${theme.colors.cream};
  border-radius: 30px;
  padding: 28px;
  box-shadow: ${theme.shadow.card};

  @media (min-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1fr min(420px, 100%);
    gap: 34px;
    padding: 36px;
  }
`

export const Kicker = styled.p`
  display: inline-flex;
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${theme.colors.chipGreen};
`

export const Title = styled.h2`
  margin: 14px 0 0;
  font-family: ${theme.fonts.display};
  font-weight: 400;
  font-size: clamp(32px, 4vw, 44px);
  color: ${theme.colors.cream};
`

export const Body = styled.p`
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
`
