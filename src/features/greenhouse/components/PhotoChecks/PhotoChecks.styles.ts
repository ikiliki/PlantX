import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.ul<{ $size: 'sm' | 'md' }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${({ $size }) => ($size === 'sm' ? '72px' : '112px')}, 1fr));
  gap: ${({ $size }) => ($size === 'sm' ? '8px' : '12px')};
  width: min(${({ $size }) => ($size === 'sm' ? '260px' : '400px')}, 100%);
  margin: 0;
  padding: 0;
  list-style: none;
`

export const Item = styled.li`
  position: relative;
  display: grid;
  min-width: 0;
`

export const Thumb = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${theme.radii.sm};
  overflow: hidden;
  background: ${theme.colors.chipGreen};
  border: 1px solid ${theme.colors.border};

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const Sticker = styled.span`
  position: absolute;
  z-index: 1;
  inset-block-end: 6px;
  inset-inline-start: 6px;
  max-width: calc(100% - 12px);
  display: flex;
`

export const Index = styled.span`
  position: absolute;
  z-index: 1;
  inset-block-start: 6px;
  inset-inline-end: 6px;
  display: grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: ${theme.radii.pill};
  background: color-mix(in srgb, var(--c-forest) 72%, transparent);
  color: ${theme.colors.creamCard};
  font-size: 10px;
  font-weight: 800;
`
