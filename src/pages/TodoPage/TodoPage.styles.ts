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

export const Heading = styled.header`
  min-width: 0;

  h1 {
    margin: 0;
    font-size: clamp(28px, 7vw, 44px);
    color: ${theme.colors.ink};
    overflow-wrap: anywhere;
  }

  @container (max-width: 720px) {
    display: none;
  }
`

export const GuestAuth = styled.div`
  width: min(420px, 100%);
  margin-inline: auto;
  padding-block: 40px;
`
