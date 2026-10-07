import styled from 'styled-components'
import { backdropEnter, popIn } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${theme.z.dialogTop};
  display: grid;
  justify-items: center;
  align-items: start;
  padding: min(14vh, 120px) ${theme.space.md} ${theme.space.md};
  background: ${theme.colors.overlay};
  ${backdropEnter}
`

/** The palette lives in the chrome's night, whatever page it opens over. */
export const Panel = styled.div`
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(640px, 100%);
  max-height: min(70svh, 560px);
  overflow: hidden;
  border: 1px solid ${theme.surface.barBorder};
  border-radius: ${theme.radii.lg};
  background: ${theme.surface.bar};
  color: ${theme.surface.barInk};
  box-shadow: ${theme.shadow.dialog};
  animation: ${popIn} ${theme.motion.slow} ${theme.motion.ease} both;
`

export const Field = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  border-bottom: 1px solid ${theme.surface.barBorder};
  color: ${theme.surface.barMuted};
`

export const Input = styled.input`
  flex: 1;
  min-width: 0;
  height: 60px;
  border: 0;
  background: transparent;
  color: ${theme.surface.barInk};
  font-size: ${theme.text.md};
  caret-color: ${theme.colors.growth};

  &::placeholder {
    color: ${theme.surface.barMuted};
  }

  &:focus,
  &:focus-visible {
    outline: none;
    box-shadow: none;
  }
`

export const Results = styled.div`
  overflow-y: auto;
  padding: 8px;
  overscroll-behavior: contain;
`

export const GroupLabel = styled.div`
  padding: 10px 10px 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  color: ${theme.surface.barMuted};
`

export const Option = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: ${theme.control.md};
  padding: 0 12px;
  border-radius: ${theme.radii.md};
  background: ${({ $active }) => ($active ? theme.surface.barActive : 'transparent')};
  color: ${({ $active }) => ($active ? theme.surface.barInk : theme.surface.barMuted)};
  font-size: ${theme.text.base};
  font-weight: 600;
  cursor: pointer;
  transition:
    background ${theme.motion.fast} ${theme.motion.ease},
    color ${theme.motion.fast} ${theme.motion.ease};

  svg {
    flex: none;
    color: ${({ $active }) => ($active ? theme.colors.growth : 'currentColor')};
  }
`

export const OptionLabel = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const OptionHint = styled.span`
  flex: none;
  font-size: ${theme.text.xs};
  font-weight: 500;
  color: ${theme.surface.barMuted};
`

export const Empty = styled.p`
  padding: 28px 12px;
  text-align: center;
  color: ${theme.surface.barMuted};
`

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  padding: 10px 16px;
  border-top: 1px solid ${theme.surface.barBorder};
  font-size: ${theme.text.xs};
  color: ${theme.surface.barMuted};
`

export const Key = styled.kbd`
  display: inline-grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border: 1px solid ${theme.surface.barBorder};
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  color: ${theme.surface.barInk};
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
`
