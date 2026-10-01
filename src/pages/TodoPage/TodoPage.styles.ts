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
  display: grid;
  gap: 6px;
  min-width: 0;

  h1 {
    margin: 0;
    font-size: clamp(28px, 4vw, 36px);
    font-weight: 800;
    color: ${theme.colors.ink};
  }
`

export const Eyebrow = styled.p`
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Description = styled.p`
  margin: 0;
  max-width: 52ch;
  color: ${theme.colors.muted};
  font-size: 15px;
  line-height: 1.45;
`

export const GuestAuth = styled.div`
  width: min(420px, 100%);
  margin-inline: auto;
  padding-block: 40px;
`
