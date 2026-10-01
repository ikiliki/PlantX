import styled from 'styled-components'
import { dialogEnter, sheetSurface } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Dialog = styled.div`
  position: relative;
  width: min(720px, 100%);
  max-height: min(92vh, 860px);
  overflow: auto;
  padding: 24px ${theme.space.lg} ${theme.space.lg};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  ${dialogEnter}
  ${sheetSurface}
`

export const Lead = styled.p`
  margin: -8px 36px 16px 0;
  color: ${theme.colors.muted};
  font-size: 13px;
  line-height: 1.4;
`

export const Section = styled.section`
  display: grid;
  gap: 10px;
  margin: 0 0 16px;
  padding-top: 12px;
  border-top: 1px solid ${theme.colors.border};
`

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${theme.colors.ink};
`

export const Card = styled.div`
  display: grid;
  gap: 10px;
  padding: 12px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.cream};
`

export const OptionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 72px auto;
  gap: 8px;
  align-items: end;
`

export const RowActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`
