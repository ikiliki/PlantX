import styled, { css } from 'styled-components'
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
  background: linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--c-cream) 55%, transparent) 46%, ${theme.colors.cream} 100%);

  &::after {
    content: '';
    position: absolute;
    inset-inline: 4px 28px;
    inset-block-end: 12px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--c-moss) 40%, transparent) 14%,
      color-mix(in srgb, var(--c-moss) 40%, transparent) 86%,
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
        color-mix(in srgb, var(--c-moss) 32%, transparent) 0%,
        color-mix(in srgb, var(--c-moss) 22%, transparent) 70%,
        transparent 100%
      );
    }
  }

  @media (max-width: calc(${theme.breakpoints.md} - 1px)) {
    display: none;
  }
`

/** The rail's replacement where the rail is hidden (the phone shell): a full row under the Add tile. */
export const PhoneRail = styled.div`
  display: none;
  grid-column: 1 / -1;
  justify-items: center;

  @media (max-width: calc(${theme.breakpoints.md} - 1px)) {
    display: grid;
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
  font-family: ${theme.fonts.display};
  font-size: ${theme.text.lg};
  font-weight: ${theme.fonts.displayWeight};
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  color: ${theme.colors.forest};
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

/** Placeholder cards inside the shelf grid; hidden for a guest under 560px. */
export const SkeletonCards = styled.div<{ $guest?: boolean }>`
  display: contents;

  ${({ $guest }) =>
    $guest &&
    css`
      @container (max-width: 559px) {
        display: none;
      }
    `}
`
