import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const FaceStack = styled.div`
  display: flex;
  align-items: center;
  pointer-events: none;
`

export const FaceTile = styled.span<{ $i: number }>`
  width: 40px;
  height: 48px;
  margin-inline-start: ${({ $i }) => ($i === 0 ? 0 : '-12px')};
  border-radius: 12px;
  border: 2px solid ${theme.colors.creamCard};
  background: ${theme.colors.chipNeutral};
  overflow: hidden;
  transform: rotate(${({ $i }) => ($i - 1) * 4}deg);
  box-shadow: ${theme.shadow.soft};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const FaceAdd = styled.span<{ $i: number }>`
  width: 40px;
  height: 48px;
  margin-inline-start: ${({ $i }) => ($i === 0 ? 0 : '-12px')};
  border-radius: 12px;
  border: 2px dashed ${theme.colors.border};
  background: ${theme.colors.chipNeutral};
  color: ${theme.colors.forest};
  display: grid;
  place-items: center;
  font-size: 22px;
  font-weight: 500;
  line-height: 1;
  transform: rotate(${({ $i }) => ($i - 1) * 4}deg);
`

export const TodoFace = styled.span`
  display: grid;
  gap: 2px;
  justify-items: center;
  min-width: 48px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: ${theme.colors.forest};
`

export const TodoCount = styled.span`
  display: grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipGreen};
  font-size: 12px;
`
