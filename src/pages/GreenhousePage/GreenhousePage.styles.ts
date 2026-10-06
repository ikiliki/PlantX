import styled from 'styled-components'
import { Link } from 'react-router-dom'
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

export const HeadBlock = styled.div`
  display: grid;
  gap: ${theme.space.md};
  min-width: 0;
`

/** Hidden title: the level card is the visible header, the h1 stays for screen readers. */
const visuallyHidden = `
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
`

export const Heading = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;

  &:not(:has(aside)) {
    display: none;
  }
`

export const HeadingCopy = styled.div`
  ${visuallyHidden}
`

export const PublicPage = styled.div`
  display: grid;
  gap: ${theme.space.lg};
  min-width: 0;
  container-type: inline-size;
`

/** Same header as your own greenhouse: the grower's level card; their name stays for screen readers. */
export const PublicHeading = styled.header`
  display: grid;
  min-width: 0;

  h1 {
    ${visuallyHidden}
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

/** A new account with no greenhouse place: a quiet tile in the level card that opens Settings (#20). */
export const PlacePrompt = styled(Link)`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  column-gap: 10px;
  box-sizing: border-box;
  padding: 8px 12px 8px 8px;
  border: 1px dashed ${theme.colors.border};
  border-radius: ${theme.radii.md};
  color: ${theme.colors.ink};
  text-decoration: none;
  transition: border-color ${theme.motion.fast} ${theme.motion.ease}, background ${theme.motion.fast} ${theme.motion.ease};

  &:hover {
    border-style: solid;
    border-color: ${theme.colors.moss};
    background: rgba(228, 235, 216, 0.4);
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }
`

export const PlaceIcon = styled.span`
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.chipGreen};
  font-size: 14px;
  line-height: 1;
`

export const PlaceCopy = styled.span`
  display: grid;
  gap: 1px;
  min-width: 0;

  strong {
    font-size: 13px;
    font-weight: 750;
    color: ${theme.colors.forest};
  }

  span {
    font-size: 11px;
    font-weight: 550;
    color: ${theme.colors.muted};
  }
`
