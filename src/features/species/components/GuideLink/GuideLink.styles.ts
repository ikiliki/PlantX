import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Arrow = styled.span`
  flex: 0 0 auto;
  font-size: 18px;
  color: ${theme.colors.forest};
  transition: transform ${theme.motion.fast} ${theme.motion.ease};
  [dir='rtl'] & {
    transform: scaleX(-1);
  }
`

export const Root = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipGreen};
  color: ${theme.colors.forest};
  text-decoration: none;
  transition:
    border-color ${theme.motion.fast} ${theme.motion.ease},
    transform ${theme.motion.fast} ${theme.motion.ease};
  &:hover {
    border-color: ${theme.colors.forest};
    transform: translateY(-1px);
  }
  &:hover ${Arrow} {
    transform: translateX(3px);
  }
  [dir='rtl'] &:hover ${Arrow} {
    transform: scaleX(-1) translateX(3px);
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.moss};
    outline-offset: 2px;
  }
`

export const Leaf = styled.span`
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.growth};
  svg {
    width: 20px;
    height: 20px;
  }
`

export const Copy = styled.span`
  display: grid;
  flex: 1 1 auto;
  gap: 2px;
  min-width: 0;
`

export const Title = styled.span`
  font-size: 15px;
  font-weight: 800;
`

export const Hint = styled.span`
  overflow: hidden;
  font-size: 13px;
  color: ${theme.colors.muted};
  text-overflow: ellipsis;
  white-space: nowrap;
`
