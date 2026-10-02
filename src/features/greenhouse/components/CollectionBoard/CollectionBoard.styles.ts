import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Board = styled.div<{ $split?: boolean }>`
  display: grid;
  gap: ${theme.space.xl};
  min-width: 0;
  min-height: 0;
  align-items: start;

  ${({ $split }) =>
    $split &&
    `
    height: 100%;

    @container (min-width: 961px) {
      grid-template-columns: minmax(0, 1fr) min(300px, 32%);
      column-gap: 0;
      /* Breathing room: the first shelf card and the activity rail stay off the page edges. */
      padding-inline: ${theme.space.lg};
    }

    @container (max-width: 960px) {
      grid-template-columns: minmax(0, 1fr);
      height: auto;
    }
  `}
`

export const ShelfFrame = styled.div`
  position: relative;
  min-width: 0;
  min-height: 0;
  height: 100%;

  @container (max-width: 960px) {
    height: auto;
  }
`

export const Shelf = styled.div`
  display: grid;
  gap: ${theme.space.lg};
  align-content: start;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  @container (min-width: 961px) {
    padding-inline-end: ${theme.space.lg};
  }

  @container (max-width: 960px) {
    height: auto;
    overflow: visible;
  }
`

/** Bottom hint that the shelf still has more plants. The bar itself stays hidden. */
export const ShelfMore = styled.div<{ $on?: boolean }>`
  position: absolute;
  z-index: 2;
  inset-inline: 0;
  inset-block-end: 0;
  height: 72px;
  pointer-events: none;
  opacity: ${({ $on }) => ($on ? 1 : 0)};
  transition: opacity ${theme.motion.base} ${theme.motion.ease};
  background: linear-gradient(180deg, rgba(244, 241, 232, 0) 0%, rgba(244, 241, 232, 0.55) 46%, ${theme.colors.cream} 100%);

  &::after {
    content: '';
    position: absolute;
    inset-inline: 4px 28px;
    inset-block-end: 12px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(93, 124, 78, 0.4) 14%,
      rgba(93, 124, 78, 0.4) 86%,
      transparent 100%
    );
  }

  @container (max-width: 960px) {
    display: none;
  }
`

export const Rail = styled.aside`
  display: grid;
  gap: 12px;
  min-width: 0;
  align-content: start;

  @container (min-width: 961px) {
    position: relative;
    width: min(300px, 100%);
    padding-inline-start: ${theme.space.xxl};

    &::before {
      content: '';
      position: absolute;
      inset-block: 0;
      inset-inline-start: 0;
      width: 1px;
      pointer-events: none;
      background: linear-gradient(
        180deg,
        rgba(93, 124, 78, 0.32) 0%,
        rgba(93, 124, 78, 0.22) 70%,
        transparent 100%
      );
    }
  }

  @media (max-width: calc(${theme.breakpoints.md} - 1px)) {
    display: none;
  }
`

export const Growing = styled.section`
  display: grid;
  gap: 16px;
  min-width: 0;
`

export const CareSections = styled.div`
  display: grid;
  gap: 20px;
  min-width: 0;
`

export const CareSection = styled.section`
  display: grid;
  gap: 10px;
  min-width: 0;
`

export const CareSectionHead = styled.h3`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const CareGrid = styled.div`
  display: grid;
  gap: 12px;
  align-items: start;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  min-width: 0;

  @container (min-width: 560px) {
    gap: ${theme.space.md};
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  > * {
    min-width: 0;
  }
`

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px 12px;
  min-width: 0;
`

export const Count = styled.span`
  font-weight: 600;
  opacity: 0.78;
`

export const Empty = styled.p`
  margin: 4px 0 0;
  color: ${theme.colors.muted};
  font-size: 14px;
`
