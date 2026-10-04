import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Hero = styled.section`
  width: min(1240px, 100%);
  margin: 0 auto;
  padding: 36px ${theme.space.md} 24px;
  display: grid;
  gap: 40px;
  align-items: center;
  min-width: 0;

  @container landing (min-width: 900px) {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: 56px;
    padding: 72px 28px 48px;
  }
`

export const Kicker = styled.p`
  display: inline-flex;
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
  background: ${theme.colors.chipGreen};
  border: 1px solid ${theme.colors.border};
  padding: 9px 12px;
  border-radius: ${theme.radii.pill};
`

export const Title = styled.h1`
  margin: 18px 0 0;
  font-family: ${theme.fonts.display};
  font-weight: 400;
  font-size: clamp(38px, 7cqi, 68px);
  line-height: 1;
  letter-spacing: -0.03em;
  color: ${theme.colors.forest};
  overflow-wrap: anywhere;
`

export const Sub = styled.p`
  margin: 22px 0 28px;
  max-width: 44ch;
  color: ${theme.colors.muted};
  font-size: 18px;
  line-height: 1.65;
`

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  > a {
    flex: 0 1 auto;
    text-align: center;
    min-width: min(160px, 100%);
  }
`

export const Primary = styled(Link)`
  ${pressable}
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.cream};
  padding: 14px 26px;
  font-weight: 800;
`

export const Secondary = styled.a`
  ${pressable}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${theme.colors.border};
  background: rgba(255, 253, 248, 0.75);
  padding: 14px 22px;
  border-radius: ${theme.radii.pill};
  font-weight: 700;
  color: ${theme.colors.forest};
  text-decoration: none;
`

export const LoginLine = styled.p`
  margin: 18px 0 0;
  color: ${theme.colors.muted};
  font-size: 14px;

  a {
    color: ${theme.colors.forest};
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`

export const Visual = styled.div`
  position: relative;
  min-width: 0;
  width: min(640px, 100%);
  justify-self: center;
`
