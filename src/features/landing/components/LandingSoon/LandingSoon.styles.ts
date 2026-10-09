import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'
import { scrollReveal, sectionLead, sectionTitle, srOnly } from '../../landingType'

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
  ${scrollReveal}
  display: grid;
  gap: 16px;
  max-width: 62ch;
  margin-bottom: 24px;
`

export const Kicker = styled.p`
  ${srOnly}
`

export const Title = styled.h2`
  ${sectionTitle}
`

export const Lead = styled.p`
  ${sectionLead}
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
  ${scrollReveal}
  padding: 24px;
  border-radius: ${theme.radii.lg};
  border: 2px dashed ${theme.colors.borderStrong};
  background: ${theme.colors.creamCard};
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
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.chipGreen};
  color: ${theme.colors.forest};
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
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
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
