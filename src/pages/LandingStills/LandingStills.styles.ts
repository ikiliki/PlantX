import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Page = styled.main`
  display: grid;
  gap: 24px;
  padding: 32px;
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
`

export const Frame = styled.div`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  background: ${theme.colors.creamCard};
`

export const Shelf = styled.div`
  padding: 16px;
  background: ${theme.colors.creamCard};
`

export const ShelfHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  strong {
    font-family: ${theme.fonts.display};
    font-weight: 400;
    font-size: 24px;
    color: ${theme.colors.forest};
  }
`

export const Row = styled.div`
  display: grid;
  grid-template-columns: 54px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid ${theme.colors.border};

  img {
    width: 54px;
    height: 54px;
    border-radius: 14px;
    object-fit: cover;
  }
`

export const PlantCopy = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;

  strong {
    font-size: 14px;
    color: ${theme.colors.ink};
  }

  span {
    font-size: 12px;
    color: ${theme.colors.muted};
  }
`

export const Shot = styled.div`
  position: relative;
  height: 180px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const Meta = styled.div`
  position: absolute;
  left: 10px;
  bottom: 10px;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  border-radius: ${theme.radii.pill};
  background: rgba(255, 253, 248, 0.94);
  font-weight: 800;
  color: ${theme.colors.forest};
`
