import styled from 'styled-components'
import { theme } from '../../theme/tokens'

/** Viewport where `CollectionBoard` puts shelf and rail side by side (961px board + main padding). */
const SPLIT_VIEWPORT = 961 + 2 * parseInt(theme.space.xl, 10)

export const Page = styled.div<{ $fill?: boolean }>`
  display: grid;
  gap: ${theme.space.lg};
  container-type: inline-size;
  min-width: 0;
  width: 100%;
  margin-top: -20px;

  @media (max-width: 899px) {
    margin-top: 0;
  }
  ${({ $fill }) =>
    $fill &&
    `
    @media (min-width: ${SPLIT_VIEWPORT}px) {
      grid-template-rows: auto minmax(0, 1fr);
      height: calc(100svh - ${theme.layout.topBar} - 56px - 72px);
      overflow: hidden;
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

    &:not(:has(aside)) {
      display: none;
    }
  }
`

export const HeadingCopy = styled.div`
  min-width: 0;
  max-width: 460px;
  h1 {
    font-size: clamp(28px, 7vw, 44px);
    color: ${theme.colors.ink};
    overflow-wrap: anywhere;
  }

  @container (max-width: 720px) {
    display: none;
  }
`

export const PublicPage = styled.div`
  display: grid;
  gap: ${theme.space.lg};
  min-width: 0;
`

export const PublicHeading = styled.header`
  min-width: 0;
  h1 {
    margin: 0;
    font-family: ${theme.fonts.display};
    font-size: clamp(28px, 7vw, 44px);
    font-weight: 400;
    color: ${theme.colors.ink};
    overflow-wrap: anywhere;
  }
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
