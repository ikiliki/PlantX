import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { backdropEnter, closeButton, dialogEnter, media, sheetBackdrop, sheetSurface, sheetUp } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${theme.z.dialogTop};
  display: grid;
  place-items: center;
  padding: ${theme.space.md};
  background: ${theme.colors.overlay};
  ${backdropEnter}
  ${sheetBackdrop}
`

export const Dialog = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(420px, 100%);
  max-height: min(92vh, 720px);
  overflow: auto;
  padding: 22px 22px 18px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  ${dialogEnter}
  ${sheetSurface}

  ${media.sm} {
    width: 100%;
    height: 75svh;
    max-height: 75svh;
    overflow: hidden;
    padding-top: 28px;
    border-radius: ${theme.radii.lg} ${theme.radii.lg} 0 0;
    animation: ${sheetUp} 240ms ${theme.motion.ease} both;
  }
`

export const Close = styled.button`
  ${closeButton}
  position: absolute;
  z-index: 5;
  top: 12px;
  inset-inline-end: 12px;
`

export const Scroll = styled.div`
  display: grid;
  gap: 14px;
  min-width: 0;

  ${media.sm} {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }
`

export const Photos = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
`

export const Photo = styled.span`
  flex: none;
  width: 148px;
  height: 112px;
  overflow: hidden;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipGreen};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

export const Name = styled.h2`
  margin: 0;
  padding-inline-end: 36px;
  font-size: 28px;
  line-height: 1.15;
  color: ${theme.colors.forest};
`

export const Scientific = styled.p`
  margin: 4px 0 0;
  color: ${theme.colors.muted};
  font-size: 14px;
`

export const Facts = styled.dl`
  display: grid;
  gap: 8px;
  margin: 0;

  div {
    display: grid;
    gap: 2px;
  }

  dt {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${theme.colors.moss};
  }

  dd {
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
    color: ${theme.colors.ink};
  }
`

export const More = styled(Link)`
  justify-self: start;
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.forest};
  text-decoration: underline;
  text-underline-offset: 3px;
`
