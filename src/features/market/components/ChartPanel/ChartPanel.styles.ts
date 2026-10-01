import styled from 'styled-components'
import { riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Panel = styled.section`
  display: grid;
  align-content: start;
  gap: 14px;
  min-width: 0;
  padding: 18px 18px 14px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards;
`

export const Head = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
`

export const Title = styled.h2`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-size: 22px;
  font-weight: 400;
  color: ${theme.colors.forest};
`

export const Hint = styled.p`
  margin: 2px 0 0;
  font-size: 13px;
  color: ${theme.colors.muted};
`
