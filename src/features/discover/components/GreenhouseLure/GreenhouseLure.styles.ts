import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { backdropEnter, closeButton, dialogEnter, sheetBackdrop, sheetSurface } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Card = styled.div<{ $compact?: boolean }>`
  display: block;
  min-width: 0;
  padding: ${({ $compact }) => ($compact ? '0' : '18px')};
  container-type: inline-size;
  border-radius: ${theme.radii.lg};
  background: ${({ $compact }) =>
    $compact
      ? 'transparent'
      : `linear-gradient(165deg, rgba(207, 234, 120, 0.45), rgba(255, 254, 250, 0) 55%),
    ${theme.colors.creamCard}`};
  border: ${({ $compact }) => ($compact ? '0' : `1px solid ${theme.colors.border}`)};
  box-shadow: ${({ $compact }) => ($compact ? 'none' : theme.shadow.soft)};
  color: ${theme.colors.ink};
  text-decoration: none;

  ${({ $compact }) =>
    !$compact &&
    css`
      &:hover {
        box-shadow: ${theme.shadow.card};
      }
    `}
`

export const Body = styled.div`
  display: grid;
  gap: 14px;
  align-items: end;
  min-width: 0;

  @container (min-width: 420px) {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 16px;
  }
`

export const Copy = styled(Link)`
  display: grid;
  gap: 6px;
  min-width: 0;
  color: inherit;
  text-decoration: none;
`

export const Eyebrow = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  line-height: 1.15;
  overflow-wrap: break-word;
  color: ${theme.colors.forest};

  @container (min-width: 420px) {
    font-size: clamp(26px, 8cqi, 32px);
  }
`

export const Lure = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${theme.colors.muted};
`

export const Open = styled.span`
  margin-top: 2px;
  font-size: 13px;
  font-weight: 700;
  color: ${theme.colors.forest};

  &::after {
    content: '→';
    display: inline-block;
    margin-inline-start: 6px;
  }

  [dir='rtl'] &::after {
    content: '←';
  }
`

export const Photos = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`

export const CompactTrigger = styled.button`
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: start;

  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 4px;
    border-radius: ${theme.radii.md};
  }
`

const tile = css<{ $i: number; $compact?: boolean }>`
  width: ${({ $compact }) => ($compact ? '56px' : '76px')};
  height: ${({ $compact }) => ($compact ? '72px' : '98px')};
  margin-inline-start: ${({ $i, $compact }) => ($i === 0 ? 0 : $compact ? '-16px' : '-22px')};
  border-radius: ${({ $compact }) => ($compact ? '14px' : '16px')};
  border: 3px solid ${theme.colors.creamCard};
  background: ${theme.colors.chipNeutral};
  transform: rotate(${({ $i }) => ($i - 1) * 4}deg);
  box-shadow: ${theme.shadow.soft};
`

export const Photo = styled(Link)<{ $i: number; $compact?: boolean }>`
  ${tile}
  display: block;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const PhotoTile = styled.span<{ $i: number; $compact?: boolean }>`
  ${tile}
  display: block;
  overflow: hidden;
  pointer-events: none;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const AddSlot = styled.button<{ $i: number; $compact?: boolean }>`
  ${tile}
  display: grid;
  place-items: center;
  padding: 0;
  opacity: 0.45;
  color: ${theme.colors.forest};
  font-size: ${({ $compact }) => ($compact ? '24px' : '28px')};
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  transition: opacity ${theme.motion.fast} ${theme.motion.ease};

  &:hover {
    opacity: 0.72;
  }
`

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

  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.space.sm};
    padding-bottom: calc(${theme.space.sm} + env(safe-area-inset-bottom));
    align-items: end;
  }
`

export const Sheet = styled.div`
  position: relative;
  width: min(420px, 100%);
  max-height: min(92vh, 640px);
  overflow: auto;
  padding: 22px ${theme.space.md} ${theme.space.md};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.cream};
  container-type: inline-size;
  min-width: 0;
  ${dialogEnter}
  ${sheetSurface}

  @media (max-width: ${theme.breakpoints.md}) {
    width: 100%;
    max-height: min(92svh, 640px);
    border-radius: ${theme.radii.lg} ${theme.radii.lg} 0 0;
  }
`

export const SheetClose = styled.button`
  ${closeButton}
  position: absolute;
  top: 12px;
  inset-inline-end: 12px;
  z-index: 1;
`

export const SheetCard = styled.div`
  min-width: 0;
  padding: 18px;
  padding-top: 28px;
  border-radius: ${theme.radii.lg};
  background:
    linear-gradient(165deg, rgba(207, 234, 120, 0.45), rgba(255, 254, 250, 0) 55%),
    ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadow.soft};
  color: ${theme.colors.ink};
`
