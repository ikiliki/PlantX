import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Band = styled.section`
  width: min(1240px, 100%);
  margin: 0 auto;
  padding: 24px ${theme.space.md} 56px;
  scroll-margin-top: 72px;

  @container landing (min-width: 900px) {
    padding: 24px 28px 88px;
  }
`

export const Head = styled.div`
  display: grid;
  gap: 12px;
  max-width: 62ch;
  margin-bottom: 24px;
`

export const Kicker = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Title = styled.h2`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: clamp(32px, 5cqi, 48px);
  line-height: 1.05;
  color: ${theme.colors.forest};
`

export const Lead = styled.p`
  margin: 0;
  color: ${theme.colors.muted};
  font-size: 17px;
  line-height: 1.6;
`

export const Cards = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;

  @container landing (min-width: 760px) {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    align-items: start;
  }
`

/** Dashed and quiet on purpose: a preview, not a door. */
export const Card = styled.article`
  min-width: 0;
  display: grid;
  gap: 12px;
  padding: 20px;
  border-radius: ${theme.radii.lg};
  border: 1.5px dashed ${theme.colors.border};
  background: rgba(255, 253, 248, 0.5);
  cursor: default;
`

export const CardHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
`

export const CardIcon = styled.span`
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${theme.colors.chipNeutral};
  color: ${theme.colors.muted};
`

export const CardTitle = styled.h3`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: 24px;
  color: ${theme.colors.forest};
`

export const Pill = styled.span`
  margin-inline-start: auto;
  padding: 5px 10px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipWarm};
  color: ${theme.colors.warn};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
`

export const Body = styled.p`
  margin: 0;
  color: ${theme.colors.muted};
  font-size: 15px;
  line-height: 1.6;
`

/** Blurred sample plants: hints at the market without showing listings. */
export const Strip = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  img {
    display: block;
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    border-radius: ${theme.radii.md};
    filter: blur(3px) saturate(0.6);
    opacity: 0.55;
    user-select: none;
  }
`
