import styled from 'styled-components'
import { riseIn } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const Frame = styled.section`
  display: grid;
  place-items: center;
  min-height: min(420px, 60svh);
  width: 100%;
  padding: ${theme.space.xl} ${theme.space.md};
  animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} both;
`

export const Card = styled.div`
  display: grid;
  justify-items: center;
  gap: 12px;
  width: min(420px, 100%);
  padding: clamp(28px, 4vw, 40px) clamp(22px, 3vw, 32px);
  text-align: center;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background:
    radial-gradient(80% 70% at 50% 0%, color-mix(in srgb, var(--c-growth) 16%, transparent), transparent 60%),
    ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
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
  font-size: clamp(28px, 4vw, 36px);
  line-height: 1.15;
  color: ${theme.colors.forest};
`

export const Body = styled.p`
  margin: 0;
  max-width: 32ch;
  font-size: 15px;
  line-height: 1.5;
  color: ${theme.colors.muted};
`
