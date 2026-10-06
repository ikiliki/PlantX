import styled, { css, keyframes } from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-6px) rotate(8deg); }
`

const ring = keyframes`
  0% { transform: scale(0.85); opacity: 0.7; }
  100% { transform: scale(1.6); opacity: 0; }
`

export const Root = styled.div`
  display: grid;
  gap: 12px;
  min-width: 0;
`

export const Drop = styled.button<{ $dragging: boolean }>`
  ${pressable}
  display: grid;
  justify-items: center;
  gap: 18px;
  width: 100%;
  padding: 44px 20px;
  border-radius: ${theme.radii.lg};
  border: 2px dashed ${({ $dragging }) => ($dragging ? theme.colors.forest : theme.colors.border)};
  background:
    radial-gradient(circle at 50% 30%, rgba(207, 234, 120, 0.35), transparent 60%),
    ${theme.colors.creamCard};
  color: ${theme.colors.ink};
  font: inherit;
  text-align: center;
  cursor: pointer;

  &:hover {
    border-color: ${theme.colors.moss};
  }

  ${({ $dragging }) =>
    $dragging &&
    css`
      transform: scale(1.01);
      box-shadow: 0 0 0 6px ${theme.colors.chipGreen};
    `}
`

export const DropArt = styled.span`
  position: relative;
  display: grid;
  place-items: center;
  width: 84px;
  height: 84px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.growth};
  font-size: 34px;
  box-shadow: ${theme.shadow.card};

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    border: 2px solid ${theme.colors.growth};
    animation: ${ring} 2.2s ${theme.motion.ease} infinite;
  }

  &::after {
    animation-delay: 1.1s;
  }

  span {
    animation: ${float} 2.6s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    &::before,
    &::after,
    span {
      animation: none;
    }
  }
`

export const DropCopy = styled.span`
  display: grid;
  gap: 6px;
  max-width: 340px;

  strong {
    font-family: ${theme.fonts.display};
    font-weight: ${theme.fonts.displayWeight};
    font-size: 22px;
    color: ${theme.colors.forest};
  }

  small {
    font-size: 13px;
    line-height: 1.45;
    color: ${theme.colors.muted};
  }
`

const slotIn = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(0.92); }
  to { opacity: 1; transform: none; }
`

export const Strip = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  width: min(420px, 100%);
  justify-self: center;
`

export const Slot = styled.div<{ $on: boolean }>`
  position: relative;
  min-width: 0;
  animation: ${slotIn} ${theme.motion.slow} ${theme.motion.spring} both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  > button:first-child {
    box-shadow: ${({ $on }) => ($on ? `0 0 0 3px ${theme.colors.growth}, 0 0 0 5px ${theme.colors.forest}` : 'none')};
  }
`

export const SlotButton = styled.button`
  ${pressable}
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1;
  padding: 0;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  overflow: hidden;
  background: ${theme.colors.chipGreen};
  cursor: pointer;
  transition: box-shadow ${theme.motion.base} ${theme.motion.ease};

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const SlotSticker = styled.span`
  position: absolute;
  z-index: 1;
  inset-block-end: 6px;
  inset-inline-start: 6px;
  max-width: calc(100% - 12px);
  display: flex;
  pointer-events: none;
`

export const Remove = styled.button`
  ${pressable}
  position: absolute;
  z-index: 2;
  inset-block-start: -8px;
  inset-inline-end: -8px;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 2px solid ${theme.colors.creamCard};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.creamCard};
  font: inherit;
  font-size: 15px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  box-shadow: ${theme.shadow.soft};
`

export const AddSlot = styled.button<{ $dragging: boolean }>`
  ${pressable}
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 2px;
  aspect-ratio: 1;
  min-width: 0;
  padding: 8px;
  border: 2px dashed ${({ $dragging }) => ($dragging ? theme.colors.forest : theme.colors.border)};
  border-radius: ${theme.radii.md};
  background: ${({ $dragging }) => ($dragging ? theme.colors.chipGreen : theme.colors.creamCard)};
  color: ${theme.colors.forest};
  font: inherit;
  text-align: center;
  cursor: pointer;

  &:hover {
    border-color: ${theme.colors.moss};
  }

  span {
    font-size: 24px;
    font-weight: 300;
    line-height: 1;
  }

  strong {
    font-size: 12px;
    font-weight: 800;
  }

  small {
    font-size: 11px;
    color: ${theme.colors.muted};
  }
`

export const StripHint = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: ${theme.colors.muted};
  text-align: center;
`

/** A picked photo the browser cannot decode (e.g. HEIC on Chrome): what happened and what to do. */
export const Unreadable = styled.div`
  display: grid;
  gap: 4px;
  margin-top: 10px;
  padding: 12px 14px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipWarm};
  color: ${theme.colors.ink};
  font-size: 13px;
  line-height: 1.5;
  text-align: start;

  strong {
    color: ${theme.colors.danger};
  }
`
