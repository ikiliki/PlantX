import styled, { keyframes } from 'styled-components'
import { theme } from '../../theme/tokens'

const drift = keyframes`
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(0, -10px, 0) scale(1.04); }
`

export const Stage = styled.section<{ $x: number; $y: number; $cover?: boolean; $frame?: boolean }>`
  position: ${(p) => (p.$cover ? 'fixed' : 'relative')};
  inset: ${(p) => (p.$cover ? '0' : 'auto')};
  z-index: ${(p) => (p.$cover ? 80 : 'auto')};
  isolation: isolate;
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: ${(p) => (p.$frame ? '100%' : '100svh')};
  height: ${(p) => (p.$frame ? '100%' : 'auto')};
  padding: ${theme.space.lg};
  overflow: auto;
  background:
    radial-gradient(
      42% 36% at ${(p) => p.$x}% ${(p) => p.$y}%,
      rgba(207, 234, 120, 0.45),
      transparent 70%
    ),
    ${theme.colors.cream};
  color: ${theme.colors.ink};

  @media (prefers-reduced-motion: reduce) {
    background: ${theme.colors.cream};
  }
`

export const Back = styled.a`
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px 0 10px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.forest};
  font-size: 14px;
  font-weight: 650;
  text-decoration: none;
  box-shadow: ${theme.shadow.soft};
  transition: transform ${theme.motion.fast} ${theme.motion.ease}, box-shadow ${theme.motion.fast} ${theme.motion.ease};

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadow.card};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }

  span {
    display: inline-block;
  }

  [dir='rtl'] & span {
    transform: scaleX(-1);
  }
`

export const Center = styled.div`
  display: grid;
  place-items: center;
  padding: ${theme.space.lg} 0 ${theme.space.xxl};
`

export const Card = styled.div`
  display: grid;
  justify-items: center;
  gap: 14px;
  width: min(520px, 100%);
  padding: clamp(28px, 5vw, 44px) clamp(20px, 4vw, 36px);
  text-align: center;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.lift};
`

export const Orb = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 30%, #fff, transparent 42%),
    ${theme.colors.growth};
  box-shadow: inset 0 -10px 16px rgba(18, 60, 45, 0.12);
  animation: ${drift} 3.6s ${theme.motion.ease} infinite alternate;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const Mark = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 2px 12px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipWarm};
  border: 1px solid ${theme.colors.border};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  color: ${theme.colors.warn};
`

export const Title = styled.h1`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: clamp(32px, 5vw, 46px);
  line-height: 1.12;
  color: ${theme.colors.forest};
`

export const Body = styled.p`
  margin: 0;
  max-width: 34ch;
  font-size: 16px;
  line-height: 1.5;
  color: ${theme.colors.muted};
`
