import styled from 'styled-components'
import { backdropEnter, sheetUp } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${theme.z.dialog};
  display: flex;
  align-items: flex-end;
  background: ${theme.colors.overlay};
  ${backdropEnter}
`

/** Short sheet: the month grid is compact, so the popup stays well under a full phone sheet. */
export const Sheet = styled.div`
  position: relative;
  display: grid;
  gap: 10px;
  width: 100%;
  height: auto;
  max-height: min(460px, 72svh);
  overflow: auto;
  padding: 28px ${theme.space.md} calc(${theme.space.md} + env(safe-area-inset-bottom));
  border-radius: ${theme.radii.lg} ${theme.radii.lg} 0 0;
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.dialog};
  animation: ${sheetUp} ${theme.motion.base} ${theme.motion.ease} both;
`

export const Head = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
`

export const Month = styled.h2`
  margin: 0;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  color: ${theme.colors.ink};
`

export const Nav = styled.button`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.cream};
  color: ${theme.colors.ink};
  font: inherit;
  font-size: 18px;
  cursor: pointer;
`

export const Week = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  font-size: 10px;
  font-weight: 700;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  color: ${theme.colors.moss};
  text-align: center;
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 2px;
`

export const Blank = styled.span`
  height: 36px;
`

export const Note = styled.p`
  margin: 0;
  color: ${theme.colors.muted};
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
`

export const Day = styled.button<{ $on?: boolean; $today?: boolean; $mark?: boolean; $locked?: boolean }>`
  position: relative;
  display: grid;
  place-items: center;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.forest : 'transparent')};
  color: ${({ $on }) => ($on ? theme.colors.creamCard : theme.colors.ink)};
  box-shadow: ${({ $today, $on }) => ($today && !$on ? `inset 0 0 0 1.5px ${theme.colors.moss}` : 'none')};
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: ${({ $locked }) => ($locked ? 'default' : 'pointer')};
  opacity: ${({ $locked }) => ($locked ? 0.35 : 1)};

  &::after {
    content: '';
    display: ${({ $mark, $on }) => ($mark && !$on ? 'block' : 'none')};
    position: absolute;
    bottom: 4px;
    width: 4px;
    height: 4px;
    border-radius: ${theme.radii.pill};
    background: ${({ $on }) => ($on ? theme.colors.growth : theme.colors.moss)};
  }
`
