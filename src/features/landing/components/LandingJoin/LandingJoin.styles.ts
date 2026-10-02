import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Wrap = styled.section`
  width: min(1180px, 100%);
  margin: 0 auto 72px;
  padding: 0 ${theme.space.md};
  scroll-margin-top: 72px;
`

export const Box = styled.div`
  display: grid;
  gap: 28px;
  align-items: center;
  min-width: 0;
  border-radius: 30px;
  padding: 28px;
  background:
    radial-gradient(90% 120% at 0% 0%, rgba(207, 234, 120, 0.35), transparent 60%),
    ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadow.card};

  @container landing (min-width: 900px) {
    grid-template-columns: minmax(0, 1fr) min(400px, 100%);
    gap: 48px;
    padding: 48px;
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
  margin: 14px 0 0;
  font-family: ${theme.fonts.display};
  font-weight: 400;
  font-size: clamp(34px, 5cqi, 52px);
  line-height: 1.02;
  color: ${theme.colors.forest};
`

export const Body = styled.p`
  margin: 16px 0 0;
  max-width: 44ch;
  color: ${theme.colors.muted};
  font-size: 17px;
  line-height: 1.6;
`

export const Card = styled.div`
  min-width: 0;
  width: 100%;
`

export const Open = styled(Link)`
  ${pressable}
  display: inline-flex;
  justify-content: center;
  width: 100%;
  padding: 16px 24px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.cream};
  font-weight: 800;
`
