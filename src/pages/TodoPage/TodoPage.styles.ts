import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Page = styled.div`
  container-type: inline-size;
  display: grid;
  gap: ${theme.space.xl};
  width: min(100%, 1040px);
  margin-inline: auto;
  min-width: 0;
`

/** Visually hidden on every width: the filter chips lead the page; the h1 stays for screen readers. */
export const Heading = styled.header`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`
