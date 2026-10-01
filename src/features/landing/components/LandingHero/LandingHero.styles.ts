import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Hero = styled.section`
  width: min(1240px, 100%);
  margin: 0 auto;
  padding: 48px ${theme.space.md} 28px;
  display: grid;
  gap: 36px;
  align-items: center;

  @media (min-width: ${theme.breakpoints.md}) {
    grid-template-columns: 1.02fr 0.98fr;
    gap: 72px;
    padding: 72px 28px 40px;
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
  font-size: clamp(42px, 6vw, 68px);
  line-height: 0.97;
  letter-spacing: -0.03em;
  color: ${theme.colors.forest};
`

export const Sub = styled.p`
  margin: 22px 0 28px;
  max-width: 38ch;
  color: ${theme.colors.muted};
  font-size: 18px;
  line-height: 1.65;
`

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`

export const Primary = styled.a`
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.growth};
  color: ${theme.colors.forest};
  padding: 12px 18px;
  font-weight: 800;
`

export const Secondary = styled.a`
  border: 1px solid ${theme.colors.border};
  background: rgba(255, 253, 248, 0.75);
  padding: 12px 18px;
  border-radius: ${theme.radii.pill};
  font-weight: 700;
  color: ${theme.colors.forest};
`

export const Trust = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  align-items: center;
  margin-top: 24px;
  color: ${theme.colors.muted};
  font-size: 12px;

  strong {
    color: ${theme.colors.ink};
  }
`

export const Visual = styled.div`
  position: relative;
  min-height: 460px;

  @media (min-width: ${theme.breakpoints.md}) {
    min-height: 520px;
  }
`

export const PhotoMain = styled.div`
  position: absolute;
  inset-inline-start: 0;
  top: 42px;
  width: 67%;
  height: 340px;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: ${theme.shadow.card};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (min-width: ${theme.breakpoints.md}) {
    height: 390px;
  }
`

export const PhotoSmall = styled.div<{ $slot: 'a' | 'b' }>`
  position: absolute;
  inset-inline-end: 0;
  top: ${({ $slot }) => ($slot === 'a' ? '0' : '208px')};
  width: 36%;
  height: 170px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: ${theme.shadow.card};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (min-width: ${theme.breakpoints.md}) {
    height: 190px;
  }
`

export const MarketCard = styled.div`
  position: absolute;
  inset-inline-start: 10%;
  bottom: 0;
  width: min(78%, 420px);
  background: rgba(255, 253, 248, 0.96);
  border: 1px solid ${theme.colors.border};
  border-radius: 22px;
  box-shadow: ${theme.shadow.card};
  padding: 15px;
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 12px;
  align-items: center;

  img {
    width: 64px;
    height: 64px;
    border-radius: 15px;
    object-fit: cover;
  }

  small {
    color: ${theme.colors.muted};
    font-size: 11px;
  }

  strong {
    display: block;
    color: ${theme.colors.ink};
  }
`

export const Price = styled.div`
  font-weight: 800;
  font-size: 18px;
  color: ${theme.colors.forest};
`
