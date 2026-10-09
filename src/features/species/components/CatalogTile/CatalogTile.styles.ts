import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Root = styled.button`
  ${pressable}
  display: grid;
  gap: 6px;
  align-content: start;
  min-width: 0;
  margin: 0;
  padding: 6px 6px 10px;
  border: 0;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.card};
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid ${theme.colors.growth};
    outline-offset: 2px;
  }
`

export const Photo = styled.span`
  display: block;
  aspect-ratio: 1;
  max-width: 100%;
  overflow: hidden;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipGreen};

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const Name = styled.span`
  padding-inline: 4px;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: ${theme.text.base};
  line-height: 1.2;
  color: ${theme.colors.ink};
  overflow-wrap: anywhere;
`

export const Care = styled.span`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
  padding-inline: 4px;
`

export const CareItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  max-width: 100%;
  font-size: ${theme.text.xs};
  font-weight: 700;
  color: ${theme.colors.muted};

  svg {
    flex: none;
    color: ${theme.colors.moss};
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`
