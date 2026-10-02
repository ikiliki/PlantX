import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Section = styled.section`
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: 20px ${theme.space.md} 40px;
`

export const Feature = styled.div`
  display: grid;
  gap: 28px;
  align-items: center;
  background: linear-gradient(140deg, ${theme.colors.chipGreen}, ${theme.colors.cream});
  border: 1px solid ${theme.colors.border};
  border-radius: 30px;
  padding: 24px;

  @media (min-width: ${theme.breakpoints.md}) {
    grid-template-columns: 0.82fr 1.18fr;
    gap: 36px;
    padding: 34px;
  }
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
  margin: 12px 0 0;
  font-family: ${theme.fonts.display};
  font-weight: 400;
  font-size: clamp(32px, 4vw, 42px);
  color: ${theme.colors.forest};
`

export const Body = styled.p`
  color: ${theme.colors.muted};
  line-height: 1.65;
`

export const Checks = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 20px;
`

export const Check = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  color: ${theme.colors.ink};

  i {
    width: 22px;
    height: 22px;
    flex: none;
    border-radius: 50%;
    background: ${theme.colors.growth};
    display: grid;
    place-items: center;
    font-style: normal;
    font-size: 12px;
    color: ${theme.colors.forest};
  }
`

export const Devices = styled.div`
  display: grid;
  gap: 14px;
  align-items: end;
  min-width: 0;

  @media (min-width: 720px) {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 16px;
  }
`

export const Desk = styled.div`
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.card};
  min-height: 220px;
  aspect-ratio: 16 / 10;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 32%;
  }
`

export const Phones = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  min-width: 0;
`

export const Phone = styled.div`
  width: min(124px, 38vw);
  aspect-ratio: 390 / 844;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.card};
  flex: none;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }
`
