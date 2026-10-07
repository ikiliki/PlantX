import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Card = styled.article`
  display: grid;
  grid-template-rows: 120px auto;
  min-width: 0;
  overflow: hidden;
  border: 1.5px dashed ${theme.colors.moss};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.cream};
  color: ${theme.colors.ink};
`

export const Photo = styled.div`
  position: relative;
  min-height: 0;
  overflow: hidden;
  background: ${theme.colors.chipGreen};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    opacity: 0.78;
    filter: saturate(0.7);
  }
`

export const Pending = styled.span`
  position: absolute;
  top: 8px;
  inset-inline-start: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
  color: ${theme.colors.warn};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
  }
`

export const Body = styled.div`
  display: grid;
  gap: 4px;
  padding: 12px 12px 14px;
`

export const Name = styled.strong`
  font-family: ${theme.fonts.display};
  font-size: 20px;
  font-weight: ${theme.fonts.displayWeight};
  line-height: 1.15;
  color: ${theme.colors.forest};
  overflow-wrap: anywhere;
`

export const Scientific = styled.em`
  font-size: 12px;
  font-style: italic;
  color: ${theme.colors.muted};
`

export const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin-top: 4px;
  font-size: 12px;
  color: ${theme.colors.muted};
`
