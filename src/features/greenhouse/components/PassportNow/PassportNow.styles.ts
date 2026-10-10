import styled, { css } from 'styled-components'
import { riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

type Tone = 'water' | 'photo' | 'calm'

const tint: Record<Tone, string> = {
  water: 'color-mix(in srgb, var(--c-water) 14%, var(--c-creamCard))',
  photo: 'color-mix(in srgb, var(--c-metal) 14%, var(--c-creamCard))',
  calm: 'color-mix(in srgb, var(--c-creamCard) 70%, transparent)',
}

const edge: Record<Tone, string> = {
  water: 'color-mix(in srgb, var(--c-water) 40%, transparent)',
  photo: 'color-mix(in srgb, var(--c-metal) 40%, transparent)',
  calm: 'color-mix(in srgb, var(--c-forest) 10%, transparent)',
}

export const Root = styled.div<{ $tone: Tone; $late?: boolean }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid ${({ $tone, $late }) => ($late ? theme.colors.warn : edge[$tone])};
  border-radius: ${theme.radii.md};
  background: ${({ $tone }) => tint[$tone]};
  color: ${theme.colors.ink};
  text-decoration: none;
  animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards;
  ${({ as }) =>
    as
      ? css`
          cursor: pointer;
          transition: box-shadow ${theme.motion.base} ${theme.motion.ease};
          &:hover {
            box-shadow: ${theme.shadow.soft};
          }
          &:focus-visible {
            outline: 2px solid ${theme.colors.growth};
            outline-offset: 2px;
          }
        `
      : ''}
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const Mark = styled.span`
  display: inline-flex;
  line-height: 0;
`

export const Body = styled.span`
  display: grid;
  gap: 1px;
  min-width: 0;
  grid-column: 2;
  &:first-child {
    grid-column: 1 / 3;
  }
`

export const Label = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  color: ${theme.colors.moss};
`

export const Line = styled.span`
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.forest};
  overflow-wrap: anywhere;
`

export const Go = styled.span`
  font-size: 20px;
  line-height: 1;
  color: ${theme.colors.moss};
  [dir='rtl'] & {
    transform: scaleX(-1);
  }
`
