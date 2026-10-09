import styled, { css } from 'styled-components'
import { media, popIn, riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

const onForest = (alpha: number) => `color-mix(in srgb, var(--c-cream) calc(${alpha} * 100%), transparent)`

export const Root = styled.aside<{ $compact?: boolean }>`
  display: grid;
  grid-template-rows: auto auto 1fr;
  align-content: start;
  gap: ${theme.space.lg};
  min-width: 0;
  min-height: 0;
  height: 100%;
  padding: ${theme.space.xl} ${theme.space.lg} ${theme.space.lg};
  color: ${theme.colors.cream};
  background:
    radial-gradient(120% 70% at 0% 0%, color-mix(in srgb, var(--c-growth) 18%, transparent), transparent 60%),
    linear-gradient(165deg, ${theme.colors.forestSoft}, ${theme.colors.forest});
  ${({ $compact }) =>
    $compact &&
    css`
      height: auto;
      grid-template-rows: auto;
      gap: 12px;
      padding: 18px 20px 16px;
    `}
  ${media.md} {
    overflow: ${({ $compact }) => ($compact ? 'visible' : 'auto')};
    scrollbar-width: none;
  }
`

export const Identity = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;
`

export const AvatarRing = styled.div`
  flex-shrink: 0;
  width: fit-content;
  padding: 4px;
  border-radius: ${theme.radii.pill};
  background: ${onForest(0.12)};
  box-shadow: 0 0 0 1px ${onForest(0.2)};
  animation: ${popIn} ${theme.motion.slow} ${theme.motion.spring} backwards;
`

export const NameBlock = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
  padding-top: 4px;
`

export const Name = styled.h2`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-size: clamp(26px, 3vw, 34px);
  font-weight: ${theme.fonts.displayWeight};
  line-height: 1.1;
  color: ${theme.colors.cream};
`

export const Role = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${onForest(0.72)};
`

export const Bio = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: ${onForest(0.9)};
`

export const Foot = styled.div`
  display: grid;
  gap: ${theme.space.lg};
  align-content: end;
  margin-top: auto;
  padding-top: ${theme.space.xl};
`

export const Stats = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
`

export const Stat = styled.div`
  display: grid;
  gap: 4px;
  padding: 14px 14px;
  border: 1px solid ${onForest(0.1)};
  border-radius: ${theme.radii.md};
  background: ${onForest(0.07)};
  animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards;
  ${[1, 2, 3, 4].map((n) => `&:nth-child(${n}) { animation-delay: ${60 + n * 40}ms; }`).join('\n')}
  dt {
    font-size: 12px;
    color: ${onForest(0.66)};
  }
  dd {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: ${theme.colors.cream};
  }
`

export const SpecialtyBlock = styled.div`
  display: grid;
  gap: 12px;
`

export const Label = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  color: ${onForest(0.6)};
`

export const Specialties = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  li {
    padding: 6px 12px;
    border-radius: ${theme.radii.pill};
    background: color-mix(in srgb, var(--c-growth) 16%, transparent);
    color: ${theme.colors.growth};
    font-size: 13px;
    font-weight: 600;
  }
`

export const Missing = styled.p`
  margin: 0;
  padding: ${theme.space.xxl} ${theme.space.lg};
  color: ${theme.colors.muted};
  text-align: center;
`
