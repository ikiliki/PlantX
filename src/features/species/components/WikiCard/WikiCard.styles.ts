import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Card = styled(Link)`
  display: grid;
  grid-template-rows: 120px auto;
  min-width: 0;
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.ink};
  text-decoration: none;
  &:hover {
    border-color: ${theme.colors.forest};
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.moss};
    outline-offset: 2px;
  }
`

export const Photo = styled.div`
  min-height: 0;
  overflow: hidden;
  background: ${theme.colors.chipGreen};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
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
  font-weight: 400;
  line-height: 1.15;
  color: ${theme.colors.forest};
`

export const Scientific = styled.em`
  font-size: 12px;
  font-style: italic;
  color: ${theme.colors.muted};
`

export const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-top: 4px;
  font-size: 12px;
  color: ${theme.colors.muted};
`
