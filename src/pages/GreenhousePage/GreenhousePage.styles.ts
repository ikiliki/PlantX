import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Page = styled.div<{ $fill?: boolean }>`
  display: grid;
  gap: ${theme.space.lg};
  container-type: inline-size;
  min-width: 0;
  width: 100%;
  margin-top: -20px;
  ${({ $fill }) =>
    $fill &&
    `
    grid-template-rows: auto minmax(0, 1fr);
    height: calc(100svh - ${theme.layout.topBar} - 56px - 72px);
    overflow: hidden;

    @media (max-width: ${theme.breakpoints.md}) {
      height: calc(100svh - ${theme.layout.topBar} - ${theme.space.md} - ${theme.layout.bottomNav} - ${theme.space.xl});
    }
  `}
`

export const Heading = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  column-gap: ${theme.space.xl};

  @container (max-width: 720px) {
    grid-template-columns: 1fr;
    align-items: stretch;
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
    font-size: clamp(28px, 7vw, 44px);
    color: ${theme.colors.ink};
    overflow-wrap: anywhere;
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
  overflow-wrap: anywhere;
`

export const GuestAuth = styled.div`
  display: grid;
  place-items: center;
  width: 100%;
  min-width: 0;
  min-height: min(70svh, 640px);
  padding: ${theme.space.md} 0;

  > * {
    width: min(380px, 100%);
  }
`
