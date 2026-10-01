import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Box = styled.div`
  display: grid;
  gap: 6px;
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipWarm};
  color: ${theme.colors.warn};
  font-size: 13px;
  line-height: 1.4;
  text-align: start;

  strong {
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    overflow-wrap: anywhere;
  }

  code {
    font-family: ui-monospace, monospace;
    font-size: 12px;
  }
`
