import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { backdropEnter, closeButton, dialogEnter, sheetBackdrop, sheetSurface } from '../../../../theme/motion'
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

export const Card = styled.div`
  position: relative;
  width: min(400px, 100%);
  max-height: min(640px, 100%);
  overflow: auto;
  padding: 22px 20px 16px;
  background: ${theme.colors.creamCard};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadow.dialog};
  ${dialogEnter}
  ${sheetSurface}
`

export const Close = styled.button`
  ${closeButton}
  position: absolute;
  top: 12px;
  inset-inline-end: 12px;
`

export const Face = styled.div`
  display: grid;
  justify-items: center;
  gap: 8px;
  margin-bottom: 18px;
`

export const Rows = styled.div`
  display: grid;
  gap: 14px;
`

export const Block = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
`

export const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
`

const labelType = `
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Label = styled.span`
  ${labelType}
`

export const FieldLabel = styled.label`
  ${labelType}
`

export const HiddenTitle = styled.h2`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`

export const Value = styled.p`
  margin: 0;
  min-width: 0;
  color: ${theme.colors.ink};
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
`

export const Mark = styled.span<{ $kind: 'public' | 'private' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: none;
  min-height: 22px;
  padding: 0 8px;
  border-radius: ${theme.radii.pill};
  background: ${({ $kind }) => ($kind === 'public' ? theme.colors.chipGreen : theme.colors.chipNeutral)};
  color: ${({ $kind }) => ($kind === 'public' ? theme.colors.forest : theme.colors.muted)};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
`

export const Hint = styled.p<{ $tone?: 'ok' | 'bad' }>`
  margin: 0;
  color: ${({ $tone }) =>
    $tone === 'ok' ? theme.colors.forest : $tone === 'bad' ? theme.colors.danger : theme.colors.muted};
  font-size: 13px;
  line-height: 1.35;
`

export const IconRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const IconChoice = styled.button<{ $on?: boolean }>`
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  padding: 0;
  border-radius: 50%;
  border: 2px solid ${({ $on }) => ($on ? theme.colors.forest : 'transparent')};
  background: ${({ $on }) => ($on ? theme.colors.chipGreen : 'transparent')};
  cursor: pointer;
  &:disabled {
    cursor: default;
    opacity: 0.45;
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 2px;
  }
`

export const Footer = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid ${theme.colors.border};
`

export const FooterLink = styled(Link)`
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 0 12px;
  border-radius: ${theme.radii.sm};
  color: ${theme.colors.ink};
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  &:hover {
    background: ${theme.colors.chipNeutral};
  }
`

export const Lang = styled.div`
  display: flex;
  gap: 6px;
  padding: 0 4px;
`

export const LangBtn = styled.button<{ $on?: boolean }>`
  flex: 1;
  min-height: 36px;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.chipNeutral)};
  color: ${({ $on }) => ($on ? theme.colors.creamCard : theme.colors.ink)};
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`

/** Privacy · Terms, and Delete my account, under Sign out. */
export const LegalRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  align-items: center;
  justify-content: space-between;
  padding: 4px 4px 0;
  font-size: 13px;

  a {
    color: ${theme.colors.muted};
  }
`

export const DangerLink = styled.button`
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${theme.colors.danger};
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
`
