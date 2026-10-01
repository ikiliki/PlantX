import styled from 'styled-components'
import {
  backdropEnter,
  closeButton,
  dialogEnter,
  sheetBackdrop,
  sheetSurface,
} from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Panel = styled.div`
  display: grid;
  gap: ${theme.space.xl};
`

export const StatusCard = styled.section`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
  padding: 18px 20px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
`

export const StatusCopy = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.45;
    color: ${theme.colors.muted};
  }
`

export const Reason = styled.div`
  font-size: 13px;
  line-height: 1.45;
  color: ${theme.colors.warn};
  overflow-wrap: anywhere;
`

export const StatusActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`

export const Pill = styled.span<{ $tone: 'up' | 'down' | 'loading' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 0 12px;
  border-radius: ${theme.radii.pill};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  background: ${({ $tone }) =>
    $tone === 'up'
      ? theme.colors.chipGreen
      : $tone === 'down'
        ? theme.colors.chipWarm
        : theme.colors.chipNeutral};
  color: ${({ $tone }) =>
    $tone === 'up' ? theme.colors.forest : $tone === 'down' ? theme.colors.warn : theme.colors.muted};
`

export const DocsLink = styled.a`
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: ${theme.radii.pill};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.cream};
  color: ${theme.colors.forest};
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  &:hover {
    border-color: ${theme.colors.moss};
  }
`

export const Section = styled.section<{ $demo?: boolean }>`
  display: grid;
  gap: 12px;
  order: ${({ $demo }) => ($demo ? 1 : 0)};
  min-width: 0;
  padding: 16px 18px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
`

export const SectionHead = styled.button<{ $open?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  margin: 0;
  padding: 0 0 10px;
  border: 0;
  border-bottom: 1px solid ${({ $open }) => ($open ? theme.colors.border : 'transparent')};
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;

  &:disabled {
    cursor: progress;
  }

  h2 {
    margin: 0;
    font-family: ${theme.fonts.display};
    font-size: 20px;
    font-weight: 400;
    color: ${theme.colors.forest};
  }

  h3 {
    margin: 4px 0 0;
    font-size: 14px;
    font-weight: 700;
    color: ${theme.colors.forest};
  }

  > span {
    margin-inline-start: auto;
    font-size: 12px;
    color: ${theme.colors.muted};
  }
`

export const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
`

export const UserFilter = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  min-width: 0;
  margin-inline-start: auto;
  color: ${theme.colors.muted};
  font-size: 12px;
  font-weight: 700;
`

export const UserSelect = styled.select`
  appearance: none;
  flex: 0 1 220px;
  width: 220px;
  min-width: 0;
  max-width: 100%;
  text-overflow: ellipsis;
  min-height: 36px;
  padding-block: 6px;
  padding-inline: 12px 28px;
  border-radius: ${theme.radii.sm};
  border: 1px solid ${theme.colors.border};
  background:
    linear-gradient(45deg, transparent 50%, ${theme.colors.moss} 50%) right 14px center / 5px 5px no-repeat,
    linear-gradient(135deg, ${theme.colors.moss} 50%, transparent 50%) right 9px center / 5px 5px no-repeat,
    ${theme.colors.cream};
  color: ${theme.colors.ink};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:dir(rtl) {
    background:
      linear-gradient(45deg, transparent 50%, ${theme.colors.moss} 50%) left 14px center / 5px 5px no-repeat,
      linear-gradient(135deg, ${theme.colors.moss} 50%, transparent 50%) left 9px center / 5px 5px no-repeat,
      ${theme.colors.cream};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }
`

export const HeadMeta = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${theme.colors.muted};
  font-size: 12px;
`

export const DemoRibbon = styled.span`
  padding: 2px 8px;
  border-radius: 2px;
  background: ${theme.colors.danger};
  color: ${theme.colors.cream};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const SubHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: ${theme.colors.forest};
  }

  span {
    font-size: 12px;
    color: ${theme.colors.muted};
  }
`

export const UserHover = styled.div`
  position: fixed;
  z-index: ${theme.z.dialog};
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
  width: min(260px, calc(100vw - 24px));
  padding: 12px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
  pointer-events: none;

  strong,
  span {
    display: block;
  }

  strong {
    font-size: 14px;
  }

  span {
    margin-top: 2px;
    color: ${theme.colors.muted};
    font-size: 12px;
  }
`

export const RelationLink = styled.button`
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${theme.colors.forest};
  font: inherit;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;

  &:hover {
    color: ${theme.colors.moss};
  }
`

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${theme.z.dialogTop};
  display: grid;
  place-items: center;
  padding: ${theme.space.lg};
  background: ${theme.colors.overlay};
  ${backdropEnter}
  ${sheetBackdrop}
`

export const Dialog = styled.div`
  position: relative;
  width: min(480px, 100%);
  max-height: min(90vh, 720px);
  overflow: auto;
  padding: 24px ${theme.space.lg} ${theme.space.lg};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  ${dialogEnter}
  ${sheetSurface}
`

export const PreviewPhoto = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 14px;
  overflow: hidden;
  flex-shrink: 0;
  background: ${theme.colors.chipGreen};
  border: 1px solid ${theme.colors.border};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

export const PreviewDetails = styled.div`
  margin: 0 0 16px;
`

export const Close = styled.button`
  ${closeButton}
  position: absolute;
  top: 12px;
  inset-inline-end: 12px;
`

export const DialogTitle = styled.h2`
  margin: 0 36px 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.ink};
`

export const PreviewCard = styled.div`
  display: grid;
  gap: 14px;
  padding: 18px;
  margin: 12px 0 16px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.cream};
`

export const PreviewIdentity = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: center;
`

export const PreviewName = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;

  strong {
    font-size: 18px;
    color: ${theme.colors.forest};
  }

  span {
    font-size: 13px;
    color: ${theme.colors.muted};
  }
`

export const PreviewNote = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${theme.colors.ink};
`

export const PreviewStats = styled.dl`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 0;

  div {
    display: grid;
    gap: 2px;
  }

  dt {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${theme.colors.muted};
  }

  dd {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: ${theme.colors.ink};
  }
`

export const DialogActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
`

/** Activity preview: who verified the plant and the AI check on each photo. */
export const PreviewVerify = styled.section`
  display: grid;
  gap: 10px;
  justify-items: start;
  padding-top: 12px;
  border-top: 1px dashed ${theme.colors.border};

  h3 {
    margin: 0;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${theme.colors.muted};
  }
`
