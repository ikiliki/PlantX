import { Link } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { pressable, riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`

export const Hero = styled.section`
  width: min(1240px, 100%);
  margin: 0 auto;
  padding: 36px ${theme.space.md} 24px;
  display: grid;
  gap: 40px;
  align-items: center;
  min-width: 0;

  > div:first-child {
    animation: ${riseIn} 700ms ${theme.motion.ease} both;
  }

  @container landing (min-width: 900px) {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
    gap: 64px;
    min-height: min(78svh, 780px);
    padding: 64px 28px 72px;
  }
`

export const Title = styled.h1`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: clamp(44px, 8.4cqi, 86px);
  line-height: 0.98;
  letter-spacing: -0.025em;
  text-wrap: balance;
  color: ${theme.colors.forest};
  overflow-wrap: anywhere;
`

export const Sub = styled.p`
  margin: 24px 0 32px;
  max-width: 44ch;
  color: ${theme.colors.muted};
  font-size: 19px;
  text-wrap: pretty;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 54px;
  padding: 0 28px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.cream};
  font-family: ${theme.fonts.display};
  font-size: 17px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.22), ${theme.shadow.soft};

  &:hover {
    background: ${theme.colors.forestMid};
    transform: translateY(-2px);
  }

  &:active {
    box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.22);
  }

  /* The arrow points on and out (up-right; up-left in RTL) and nudges further on hover. */
  svg {
    transform: rotate(45deg);
    transition: transform ${theme.motion.base} ${theme.motion.ease};
  }

  &:hover svg {
    transform: translate(2px, -2px) rotate(45deg);
  }

  [dir='rtl'] & svg {
    transform: rotate(-45deg);
  }

  [dir='rtl'] &:hover svg {
    transform: translate(-2px, -2px) rotate(-45deg);
  }
`

export const Secondary = styled.a`
  ${pressable}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 54px;
  border: 1px solid ${theme.colors.borderStrong};
  background: ${theme.colors.creamCard};
  padding: 0 24px;
  border-radius: ${theme.radii.pill};
  font-family: ${theme.fonts.display};
  font-size: 17px;
  font-weight: 600;
  color: ${theme.colors.forest};
  text-decoration: none;
  box-shadow: inset 0 -2px 0 ${theme.colors.border};

  &:hover {
    background: ${theme.colors.chipGreen};
    transform: translateY(-2px);
  }
`

/** The product, floating gently over a lime glow. */
export const Visual = styled.div`
  position: relative;
  min-width: 0;
  width: min(640px, 100%);
  justify-self: center;
  animation: ${float} 9s ease-in-out 1s infinite;

  &::before {
    content: '';
    position: absolute;
    inset: 8% 4% -6%;
    z-index: -1;
    border-radius: 50%;
    background: radial-gradient(closest-side, color-mix(in srgb, var(--c-growth) 55%, transparent), transparent);
    filter: blur(24px);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`
