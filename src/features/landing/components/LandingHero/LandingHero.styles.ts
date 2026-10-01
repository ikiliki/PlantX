import styled from 'styled-components'
import { riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Hero = styled.section`
  position: relative;
  overflow: hidden;
  container-type: inline-size;
  color: ${theme.colors.ink};
  background:
    radial-gradient(90% 70% at 100% 0%, rgba(207, 234, 120, 0.42), transparent 55%),
    radial-gradient(70% 55% at 0% 100%, rgba(242, 200, 167, 0.28), transparent 50%),
    linear-gradient(180deg, #eef3e4 0%, ${theme.colors.cream} 72%);
  margin-top: -68px;
  padding: calc(68px + 40px) ${theme.space.md} 40px;

  @media (min-width: ${theme.breakpoints.md}) {
    margin-top: -${theme.layout.topBar};
    padding: calc(${theme.layout.topBar} + 56px) 56px 56px;
  }
`

export const Row = styled.div`
  display: grid;
  gap: 40px;
  width: min(100%, 1180px);
  margin-inline: auto;
  align-items: center;
  animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} both;

  @container (min-width: 900px) {
    grid-template-columns: minmax(280px, 0.95fr) minmax(0, 1.05fr);
    gap: 48px;
  }
`

export const Copy = styled.div`
  display: grid;
  gap: 18px;
  min-width: 0;
`

export const Brand = styled.p`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-size: clamp(40px, 7vw, 64px);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: -0.03em;
  color: ${theme.colors.forest};
`

export const Title = styled.h1`
  margin: 0;
  font-size: clamp(26px, 3.8vw, 40px);
  line-height: 1.15;
  font-weight: 600;
  color: ${theme.colors.ink};
  max-width: 18em;
`

export const Sub = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  color: ${theme.colors.muted};
  max-width: 42ch;
`

export const Mosaic = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  grid-template-rows: 1fr 1fr;
  gap: 12px;
  min-height: 280px;
  min-width: 0;

  @container (max-width: 899px) {
    min-height: 220px;
  }
`

export const MosaicCell = styled.div<{ $tall?: boolean }>`
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
  min-width: 0;
  min-height: 0;

  ${({ $tall }) =>
    $tall
      ? `
    grid-row: 1 / span 2;
  `
      : ''}

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`
