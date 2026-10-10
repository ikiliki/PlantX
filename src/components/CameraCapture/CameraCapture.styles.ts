import styled from 'styled-components'
import { theme } from '../../theme/tokens'

/** Keeps the portal's events inside; adds no box of its own. */
export const Shield = styled.div`
  display: contents;
`

export const Viewfinder = styled.div`
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, calc(min(60svh, 560px) * 3 / 4));
  aspect-ratio: 3 / 4;
  margin-inline: auto;
  border-radius: ${theme.radii.md};
  background: #101a14;
  overflow: hidden;

  video,
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const Shot = styled.img`
  display: block;
`

export const Note = styled.p`
  margin: 0;
  font-size: 14px;
  color: #f4f1e8;
`

export const PrivacyLine = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${theme.colors.muted};

  a {
    color: ${theme.colors.forest};
    font-weight: 600;
  }
`
