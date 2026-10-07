import styled, { css, keyframes } from 'styled-components'
import { theme } from '../../../../theme/tokens'

/** List comes in from the start side, the map from the end side. */
const fromStart = keyframes`
  from { opacity: 0; transform: translateX(-18px) scale(0.985); }
  to { opacity: 1; transform: none; }
`

const fromEnd = keyframes`
  from { opacity: 0; transform: translateX(18px) scale(0.985); filter: blur(4px); }
  to { opacity: 1; transform: none; filter: none; }
`

export const Root = styled.div`
  display: grid;
  gap: 16px;
  min-width: 0;

  @container (min-width: 960px) {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 36%);
    align-items: start;
  }
`

const narrowOnly = (active: boolean, enter: ReturnType<typeof keyframes>) => css`
  @container (max-width: 959px) {
    display: ${active ? 'block' : 'none'};
    animation: ${enter} 360ms ${theme.motion.ease} both;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }
`

export const ListPane = styled.div<{ $active: boolean }>`
  display: grid;
  gap: 12px;
  align-content: start;
  min-width: 0;
  ${({ $active }) => narrowOnly($active, fromStart)}
`

export const MapPane = styled.div<{ $active: boolean }>`
  min-width: 0;
  height: min(62svh, 520px);
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  ${({ $active }) => narrowOnly($active, fromEnd)}

  @container (min-width: 960px) {
    position: sticky;
    top: calc(${theme.layout.chromeTop} + 12px);
    height: min(calc(100svh - 150px), 640px);
  }
`
