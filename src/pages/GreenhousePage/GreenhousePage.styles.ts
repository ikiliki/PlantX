import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Page = styled.div`
  display: grid;
  gap: ${theme.space.xl};
  container-type: inline-size;
  min-width: 0;
  width: 100%;
`

export const Heading = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  column-gap: ${theme.space.lg};

  @container (max-width: 720px) {
    grid-template-columns: 1fr;
    row-gap: ${theme.space.md};
  }
`

export const HeadingCopy = styled.div`
  display: grid;
  gap: 8px;
  flex: 1 1 220px;
  min-width: 0;
  max-width: 460px;
  h1 {
    font-size: clamp(30px, 4vw, 44px);
    color: ${theme.colors.ink};
  }
`

export const Eyebrow = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Description = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: ${theme.colors.muted};
`

export const GuestAuth = styled.div`
  display: grid;
  place-items: center;
  width: 100%;
  min-height: min(70svh, 640px);
  padding: ${theme.space.md} 0;

  > * {
    width: min(380px, 100%);
  }
`
