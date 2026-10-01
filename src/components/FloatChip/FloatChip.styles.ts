import styled from 'styled-components'
import { backdropEnter, closeButton, dialogEnter, sheetBackdrop, sheetSurface } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const Chip = styled.div<{ $dragging?: boolean }>`
  position: fixed;
  z-index: calc(${theme.z.bottomNav} + 1);
  touch-action: none;
  cursor: grab;
  user-select: none;
  filter: drop-shadow(0 8px 18px rgba(11, 31, 20, 0.18));
  opacity: ${({ $dragging }) => ($dragging ? 0.92 : 1)};
  transition: opacity ${theme.motion.fast} ${theme.motion.ease};

  &:active {
    cursor: grabbing;
  }

  @media (min-width: ${theme.breakpoints.md}) {
    display: none;
  }
`

export const Face = styled.button`
  position: relative;
  display: grid;
  place-items: center;
  margin: 0;
  padding: 8px;
  min-width: 56px;
  min-height: 56px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: rgba(255, 254, 250, 0.96);
  backdrop-filter: blur(10px);
  color: ${theme.colors.forest};
  cursor: inherit;
  box-shadow: ${theme.shadow.soft};

  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 3px;
  }
`

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${theme.z.dialogTop};
  display: grid;
  place-items: end center;
  padding: ${theme.space.sm};
  padding-bottom: calc(${theme.space.sm} + env(safe-area-inset-bottom));
  background: ${theme.colors.overlay};
  ${backdropEnter}
  ${sheetBackdrop}
`

export const Sheet = styled.div`
  position: relative;
  width: min(420px, 100%);
  max-height: min(88svh, 720px);
  overflow: auto;
  padding: 22px ${theme.space.md} ${theme.space.md};
  border-radius: ${theme.radii.lg} ${theme.radii.lg} 0 0;
  background: ${theme.colors.cream};
  container-type: inline-size;
  min-width: 0;
  ${dialogEnter}
  ${sheetSurface}
`

export const SheetClose = styled.button`
  ${closeButton}
  position: absolute;
  top: 12px;
  inset-inline-end: 12px;
  z-index: 1;
`

export const SheetTitle = styled.h2`
  margin: 0 36px 14px 0;
  font-family: ${theme.fonts.display};
  font-weight: 400;
  font-size: 22px;
  color: ${theme.colors.forest};

  [dir='rtl'] & {
    margin: 0 0 14px 36px;
  }
`

export const SheetBody = styled.div`
  min-width: 0;
`
