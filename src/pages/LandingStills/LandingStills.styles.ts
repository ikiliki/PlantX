import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Page = styled.main`
  display: grid;
  gap: 24px;
  min-width: 0;
  padding: clamp(16px, 5vw, 32px);
  background: ${theme.colors.cream};
`

export const Title = styled.h1`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: 400;
  color: ${theme.colors.forest};
`

export const StillGrid = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  min-width: 0;
`

export const Frame = styled.div`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  background: ${theme.colors.creamCard};
  min-height: 180px;
`

export const Shot = styled.div`
  position: relative;
  height: 100%;
  min-height: 160px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`
