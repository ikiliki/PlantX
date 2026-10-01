import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.aside`
  display: grid;
  gap: 14px;
  box-sizing: border-box;
  width: min(300px, 32cqi);
  max-width: 100%;
  margin: 0;
  padding: 18px 20px 20px;
  border-radius: ${theme.radii.lg};
  background:
    linear-gradient(155deg, rgba(207, 234, 120, 0.42), rgba(255, 254, 250, 0) 52%),
    ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadow.card};
  color: ${theme.colors.forest};
  text-align: start;

  @container (max-width: 720px) {
    width: 100%;
    gap: 12px;
    padding: 14px 16px;
    background:
      linear-gradient(165deg, rgba(207, 234, 120, 0.28), rgba(255, 254, 250, 0) 55%),
      ${theme.colors.creamCard};
    box-shadow: ${theme.shadow.soft};
  }
`

export const Label = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Stats = styled.div<{ $solo?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $solo }) => ($solo ? 'minmax(0, 1fr)' : 'minmax(0, 1.35fr) minmax(0, 1fr)')};
  gap: 0;
  min-width: 0;
  align-items: stretch;

  @container (max-width: 720px) {
    grid-template-columns: ${({ $solo }) => ($solo ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))')};
    gap: 12px 16px;
  }
`

export const Stat = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
  align-content: start;

  &:first-child:not(:only-child) {
    padding-inline-end: 18px;
    border-inline-end: 1px solid ${theme.colors.border};
  }

  &:last-child:not(:only-child) {
    padding-inline-start: 18px;
  }

  @container (max-width: 720px) {
    &:first-child,
    &:last-child {
      padding-inline: 0;
      border-inline-end: 0;
    }
  }
`

export const Value = styled.p<{ $tone?: 'money' | 'count' }>`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-size: ${({ $tone }) => ($tone === 'count' ? 'clamp(30px, 2.6vw, 40px)' : 'clamp(32px, 2.8vw, 44px)')};
  font-weight: 400;
  line-height: 1.02;
  color: ${theme.colors.forest};
  overflow-wrap: anywhere;

  @container (max-width: 720px) {
    font-size: ${({ $tone }) => ($tone === 'count' ? 'clamp(26px, 7vw, 32px)' : 'clamp(28px, 8vw, 36px)')};
  }
`

export const MarketValue = styled.div<{ $held?: boolean }>`
  display: grid;
  gap: 4px;
  min-width: 0;
  ${({ $held }) =>
    $held &&
    `
    filter: blur(6px);
    user-select: none;
    pointer-events: none;
  `}
`

export const ValueLabel = styled.span`
  display: block;
  max-width: 14em;
  font-size: 13px;
  line-height: 1.35;
  color: ${theme.colors.muted};
  overflow-wrap: anywhere;

  @container (max-width: 720px) {
    max-width: none;
    font-size: 12px;
  }
`
