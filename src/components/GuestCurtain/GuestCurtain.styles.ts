import styled from 'styled-components'
import { blurred } from '../Skeleton/Skeleton'

export const Wrap = styled.div`
  position: relative;
  display: grid;
  min-width: 0;
`

export const Behind = styled.div<{ $blur: boolean }>`
  display: grid;
  gap: 12px;
  min-width: 0;
  ${({ $blur }) => ($blur ? blurred : '')}
`

/** The card sits near the top of the placeholder so it is on screen without scrolling. */
export const Front = styled.div`
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  justify-items: center;
  align-content: start;
  padding: clamp(24px, 8vh, 72px) 12px 0;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
`
