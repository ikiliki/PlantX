import styled from 'styled-components'
import { riseIn } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const Wrap = styled.div`
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: ${theme.space.xxl} ${theme.space.lg};
  border: 2px dashed ${theme.colors.borderStrong};
  background: color-mix(in srgb, var(--c-creamCard) 50%, transparent);
  border-radius: ${theme.radii.lg};
  text-align: center;
  color: ${theme.colors.muted};
  animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} both;
`

export const Mark = styled.span`
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-bottom: 4px;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.growth};
  box-shadow: inset 0 -3px 0 color-mix(in srgb, var(--c-warn) 28%, transparent);
  color: ${theme.colors.forest};
`

export const Title = styled.strong`
  font-family: ${theme.fonts.display};
  font-size: ${theme.text.lg};
  font-weight: ${theme.fonts.displayWeight};
  letter-spacing: ${theme.fonts.displayTracking};
  color: ${theme.colors.ink};
`

export const Hint = styled.p`
  max-width: 42ch;
  font-size: ${theme.text.base};
  line-height: 1.5;
`

export const Action = styled.div`
  margin-top: 6px;
`
