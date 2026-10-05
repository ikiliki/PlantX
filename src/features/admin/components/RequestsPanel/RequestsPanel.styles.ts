import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export { HeadMeta, Panel, Section, SectionHead } from '../ServerPanel/ServerPanel.styles'

export const ExpandActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`

export const IdeasBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  p {
    flex: 1 1 240px;
    margin: 0;
    font-size: 13px;
    color: ${theme.colors.muted};
  }
`

/** A row that can be read but not approved (scan suggestions, #64). */
export const ReadOnlyNote = styled.p`
  margin: 0 0 8px;
  font-size: 13px;
  color: ${theme.colors.muted};
`

export const ScanThumb = styled.img`
  display: block;
  width: 40px;
  height: 40px;
  border-radius: ${theme.radii.sm};
  object-fit: cover;
`
