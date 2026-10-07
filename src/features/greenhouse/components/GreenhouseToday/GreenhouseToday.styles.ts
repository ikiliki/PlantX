import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Root = styled.section`
  display: grid;
  gap: 8px;
  min-width: 0;
  width: min(300px, 100%);
  padding: 12px 12px 10px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};

  @container (max-width: 960px) {
    width: 100%;
  }
`

export const Title = styled.h2`
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  color: ${theme.colors.moss};
`

export const Rows = styled.ul`
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
`

export const Row = styled.li`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-width: 0;
  min-height: 32px;
`

export const Name = styled.span`
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.ink};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const Action = styled.button`
  ${pressable}
  appearance: none;
  flex: 0 0 auto;
  margin: 0;
  min-height: 28px;
  padding: 0 10px;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.creamCard};
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;

  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 2px;
  }
`
