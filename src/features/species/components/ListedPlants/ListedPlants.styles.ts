import styled from 'styled-components'
import { riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Root = styled.section`
  display: grid;
  gap: ${theme.space.md};
  min-width: 0;
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: ${theme.space.md};
  & > * {
    animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards;
  }
  ${[1, 2, 3, 4, 5, 6].map((n) => `& > :nth-child(${n}) { animation-delay: ${n * 50}ms; }`).join('\n')}
`

export const Empty = styled.p`
  margin: 0;
  padding: ${theme.space.lg};
  border: 1px dashed ${theme.colors.border};
  border-radius: ${theme.radii.md};
  color: ${theme.colors.muted};
  font-size: 14px;
  text-align: center;
`
