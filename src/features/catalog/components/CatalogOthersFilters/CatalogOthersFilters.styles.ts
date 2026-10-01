import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.section`
  display: grid;
  gap: 10px;
  min-width: 0;
`

export const Heading = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: ${theme.colors.ink};
`

export const Hint = styled.p`
  margin: -4px 0 0;
  font-size: 13px;
  color: ${theme.colors.muted};
`

export const Group = styled.details`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.creamCard};
  overflow: hidden;

  &[open] summary svg {
    transform: rotate(180deg);
  }
`

export const GroupSummary = styled.summary`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.ink};
  cursor: pointer;
  list-style: none;
  user-select: none;

  &::-webkit-details-marker {
    display: none;
  }

  &[data-muted='true'] {
    color: ${theme.colors.muted};
  }

  svg {
    flex-shrink: 0;
    transition: transform ${theme.motion.fast} ${theme.motion.ease};
  }
`

export const GroupBody = styled.div`
  display: grid;
  gap: 14px;
  padding: 0 14px 14px;
  border-top: 1px solid ${theme.colors.border};
`

export const PropertyBlock = styled.div`
  display: grid;
  gap: 8px;
  padding-top: 14px;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.ink};
`
