import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export { Dock } from '../DemoBar/DemoBar.styles'

/** The DemoBar tab's look, as a label: nothing to open. */
export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 12px 5px;
  border: 1px solid color-mix(in srgb, var(--c-growth) 35%, transparent);
  border-top: 0;
  border-radius: 0 0 ${theme.radii.pill} ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  pointer-events: none;
`
