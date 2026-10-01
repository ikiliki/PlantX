import styled, { css } from 'styled-components'
import { backdropEnter, closeButton, fadeIn, popIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

const stacked = '@media (max-width: 760px)'

export const Gallery = styled.section<{ $embedded?: boolean; $dialog?: boolean }>`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  gap: 10px;
  padding: ${theme.space.lg} ${theme.space.lg} ${theme.space.md};
  ${({ $embedded, $dialog }) =>
    $dialog
      ? css`
          flex: 1 1 auto;
          min-height: 0;
          padding: 12px ${theme.space.lg} 8px;
          gap: 8px;
        `
      : $embedded &&
        css`
          @media (min-width: 761px) {
            padding: ${theme.space.md} ${theme.space.lg} ${theme.space.sm};
            gap: 8px;
          }
        `}
  ${stacked} {
    padding: ${theme.space.md};
  }
`

export const PhotoFrame = styled.button<{ $embedded?: boolean; $dialog?: boolean }>`
  position: relative;
  display: block;
  flex: 1 1 auto;
  width: 100%;
  min-height: clamp(240px, 40vh, 420px);
  margin: 0;
  padding: 0;
  overflow: hidden;
  ${({ $embedded, $dialog }) =>
    $dialog
      ? css`
          flex: 1 1 auto;
          height: auto;
          min-height: min(360px, 42vh);
        `
      : $embedded &&
        css`
          @media (min-width: 761px) {
            flex: 1 1 0;
            min-height: 200px;
          }
        `}
  border: 0;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.chipGreen};
  cursor: zoom-in;
  animation: ${fadeIn} ${theme.motion.slow} ${theme.motion.ease} backwards;
  box-shadow: ${theme.shadow.soft};
  transition:
    box-shadow ${theme.motion.base} ${theme.motion.ease},
    transform ${theme.motion.base} ${theme.motion.spring};

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: inset 0 0 0 1px ${theme.colors.border};
    pointer-events: none;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform ${theme.motion.slow} ${theme.motion.ease};
  }

  &:hover {
    box-shadow: ${theme.shadow.lift};
    transform: translateY(-2px);
    img {
      transform: scale(1.04);
    }
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.moss};
    outline-offset: 3px;
  }
`

export const Thumbs = styled.div`
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
`

export const Thumb = styled.button<{ $on?: boolean }>`
  flex: 0 0 auto;
  width: 76px;
  height: 58px;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border-radius: ${theme.radii.md};
  border: 2px solid ${({ $on }) => ($on ? theme.colors.forest : 'transparent')};
  background: ${theme.colors.chipGreen};
  cursor: pointer;
  opacity: ${({ $on }) => ($on ? 1 : 0.7)};
  transition:
    opacity ${theme.motion.fast} ${theme.motion.ease},
    transform ${theme.motion.fast} ${theme.motion.spring},
    border-color ${theme.motion.fast} ${theme.motion.ease};
  &:hover,
  &:focus-visible {
    opacity: 1;
    transform: translateY(-2px) scale(1.02);
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.moss};
    outline-offset: 2px;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform ${theme.motion.base} ${theme.motion.ease};
  }
  &:hover img {
    transform: scale(1.06);
  }
`

export const ViewerBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${theme.z.dialog};
  display: grid;
  place-items: center;
  padding: ${theme.space.md};
  background: ${theme.colors.overlay};
  ${backdropEnter}
`

export const ViewerCard = styled.div`
  position: relative;
  display: grid;
  gap: ${theme.space.md};
  width: min(920px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  padding: ${theme.space.md};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.dialog};
  animation: ${popIn} ${theme.motion.slow} ${theme.motion.spring} backwards;
`

export const ViewerClose = styled.button`
  ${closeButton}
  position: absolute;
  z-index: 2;
  inset-block-start: 10px;
  inset-inline-end: 10px;
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
`

export const ViewerStage = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.chipGreen};
  aspect-ratio: 4 / 3;
  max-height: min(78vh, 720px);
  animation: ${fadeIn} ${theme.motion.base} ${theme.motion.ease};

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    background: ${theme.colors.ink};
  }
`

export const ViewerStrip = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: thin;
`

export const ViewerThumb = styled.button<{ $on?: boolean }>`
  flex: 0 0 auto;
  width: 88px;
  height: 66px;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border-radius: ${theme.radii.md};
  border: 2px solid ${({ $on }) => ($on ? theme.colors.forest : theme.colors.border)};
  background: ${theme.colors.chipGreen};
  cursor: pointer;
  opacity: ${({ $on }) => ($on ? 1 : 0.75)};
  transition:
    opacity ${theme.motion.fast} ${theme.motion.ease},
    transform ${theme.motion.fast} ${theme.motion.spring};
  &:hover,
  &:focus-visible {
    opacity: 1;
    transform: scale(1.04);
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

/** AI check of the shown photo, stamped on its corner. */
export const PhotoSticker = styled.span`
  position: absolute;
  z-index: 1;
  inset-block-end: 14px;
  inset-inline-start: 14px;
  max-width: calc(100% - 28px);
  display: flex;
  pointer-events: none;
`
