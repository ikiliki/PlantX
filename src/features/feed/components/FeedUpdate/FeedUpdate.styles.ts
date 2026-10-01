import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { theme } from '../../../../theme/tokens'

const face = `
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadow.soft};
  color: inherit;
  text-decoration: none;
  transition:
    transform ${theme.motion.base} ${theme.motion.ease},
    box-shadow ${theme.motion.base} ${theme.motion.ease};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadow.lift};
  }
`

export const Card = styled.article`
  ${face}
`

export const CardLink = styled(Link)`
  ${face}
`

export const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 12px;
`

export const Kind = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Grower = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.muted};
`

export const Line = styled.p`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-size: 20px;
  line-height: 1.25;
  color: ${theme.colors.forest};
`

export const When = styled.time`
  font-size: 12px;
  color: ${theme.colors.muted};
`
