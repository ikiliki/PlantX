import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Frame = styled.div`
  box-sizing: border-box;
  min-width: 0;
  padding: 16px;
  border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.cream};
  pointer-events: none;
`

export const Stage = styled.div`
  min-width: 0;
`

/** Holds a device-sized preview; measures the room the desktop frame is zoomed down to. */
export const DeviceWell = styled.div`
  min-width: 0;
  overflow: hidden;
`

/**
 * A preview at a device's width, so container queries lay it out like that device: a 390px phone (centred),
 * or a 1280px desktop zoomed down to fit (admin only; pages never scale).
 */
export const DeviceFrame = styled.div<{ $device: 'phone' | 'desktop'; $zoom: number }>`
  container-type: inline-size;
  box-sizing: border-box;
  width: ${({ $device }) => ($device === 'phone' ? 'min(390px, 100%)' : '1280px')};
  margin-inline: ${({ $device }) => ($device === 'phone' ? 'auto' : '0')};
  zoom: ${({ $zoom }) => $zoom};
  padding: 12px;
  border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.cream};
  pointer-events: none;
`


/** One collection card, so the preview reads as the card the switch shows or hides. */
export const CardSlot = styled.div`
  width: min(280px, 100%);
`

export const Off = styled.p`
  margin: 0;
  padding: 28px 16px;
  border-radius: ${theme.radii.md};
  border: 1px dashed ${theme.colors.border};
  background: ${theme.colors.cream};
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: ${theme.colors.muted};
`
