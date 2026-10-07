import styled from 'styled-components'
import { riseIn } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const Page = styled.div`
  display: grid;
  justify-items: center;
  gap: ${theme.space.sm};
  container-type: inline-size;
  width: 100%;
  min-width: 0;
  margin-top: -${theme.space.lg};
  @container (max-width: ${theme.breakpoints.md}) {
    margin-top: 0;
  }
`

export const Heading = styled.header`
  display: grid;
  justify-items: center;
  gap: 2px;
  text-align: center;
  animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} both;
  h1 {
    font-family: ${theme.fonts.display};
    font-weight: ${theme.fonts.displayWeight};
    font-size: clamp(28px, 8cqw, 36px);
    line-height: 1.05;
    color: ${theme.colors.ink};
  }
`

export const Eyebrow = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  color: ${theme.colors.moss};
`

export const Stage = styled.section`
  width: 100%;
`
