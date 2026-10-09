import { Link } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { backdropEnter, closeButton, dialogEnter, media, sheetBackdrop, sheetSurface } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

const fade = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
`

export const Card = styled.div<{ $dialog?: boolean }>`
  display: grid;
  gap: ${({ $dialog }) => ($dialog ? '12px' : '10px')};
  width: ${({ $dialog }) => ($dialog ? '100%' : 'min(280px, calc(100vw - 24px))')};
  padding: ${({ $dialog }) => ($dialog ? '0' : '12px')};
  border: ${({ $dialog }) => ($dialog ? '0' : `1px solid ${theme.colors.border}`)};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  box-shadow: ${({ $dialog }) => ($dialog ? 'none' : theme.shadow.lift)};
  color: ${theme.colors.ink};
  animation: ${({ $dialog }) => ($dialog ? 'none' : fade)} ${theme.motion.fast} ${theme.motion.ease};
`

export const Top = styled.div<{ $bare?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $bare }) => ($bare ? 'minmax(0, 1fr)' : '56px minmax(0, 1fr)')};
  gap: 10px;
  align-items: center;
`

export const PeekGallery = styled.div<{ $count: number }>`
  display: grid;
  gap: 4px;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  border-radius: 16px;
  background: ${theme.colors.chipGreen};
  grid-template-columns: ${({ $count }) =>
    $count === 1 ? '1fr' : $count === 3 ? '1.45fr 1fr' : '1fr 1fr'};
  grid-template-rows: ${({ $count }) => ($count <= 2 ? '1fr' : '1fr 1fr')};
`

export const PeekShot = styled.div<{ $hero?: boolean }>`
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  ${({ $hero }) => $hero && 'grid-row: 1 / -1;'}
  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const PeekMore = styled.span`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--c-forest) 46%, transparent);
  color: ${theme.colors.cream};
  font-size: 18px;
  font-weight: 800;
`

export const Photo = styled.div`
  width: 56px;
  height: 56px;
  overflow: hidden;
  border-radius: 12px;
  background: ${theme.colors.chipGreen};
`

export const Copy = styled.div`
  min-width: 0;
`

export const Code = styled.p`
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: ${theme.colors.moss};
`

export const NameLine = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  margin-top: 2px;
  > p {
    margin: 0;
    min-width: 0;
  }
`

export const Name = styled.p`
  margin: 2px 0 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.25;
`

export const Fact = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.muted};
`

export const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
`

export const Price = styled.strong`
  font-size: 18px;
  color: ${theme.colors.forest};
`

export const Change = styled.span<{ $up: boolean }>`
  font-size: 12px;
  font-weight: 700;
  color: ${({ $up }) => ($up ? theme.colors.up : theme.colors.down)};
`

export const Stats = styled.dl`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 10px;
  margin: 0;
`

export const Stat = styled.div`
  min-width: 0;
  dt {
    font-size: 11px;
    color: ${theme.colors.muted};
  }
  dd {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
  }
`

export const WikiButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid ${theme.colors.forest};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipGreen};
  color: ${theme.colors.forest};
  font-size: 13px;
  font-weight: 700;
  &:hover {
    background: ${theme.colors.growth};
    color: ${theme.colors.onGrowth};
  }
`

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${theme.z.dialog};
  display: grid;
  place-items: center;
  padding: ${theme.space.md};
  background: ${theme.colors.overlay};
  overflow: hidden;
  ${backdropEnter}
  ${sheetBackdrop}
`

export const Sheet = styled.div`
  position: relative;
  width: min(400px, calc(100vw - 32px));
  max-height: min(640px, calc(100vh - 40px));
  overflow: hidden;
  padding: 16px;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  ${dialogEnter}
  ${sheetSurface}
  ${media.sm} {
    width: 100%;
    max-height: 92vh;
  }
  &:focus,
  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.dialog};
  }
`

export const Close = styled.button`
  ${closeButton}
  position: absolute;
  z-index: 2;
  top: 12px;
  inset-inline-end: 12px;
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
`
