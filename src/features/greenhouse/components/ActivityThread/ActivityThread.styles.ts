import styled, { css } from 'styled-components'
import { theme } from '../../../../theme/tokens'
import type { FeedUpdateKind } from '../../../../mock/types'
import { momentSurface } from '../../../feed/components/ActivityMoment/ActivityMoment.styles'

export const Root = styled.aside<{ $height?: number }>`
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
  width: min(300px, 100%);
  height: ${({ $height }) => ($height ? `${$height}px` : 'min(52svh, 420px)')};
  min-height: ${({ $height }) => ($height ? `${$height}px` : '220px')};
  max-height: ${({ $height }) => ($height ? `${$height}px` : 'min(52svh, 420px)')};
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--c-creamCard) 98%, transparent), color-mix(in srgb, var(--c-chipGreen) 35%, transparent)),
    ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
  overflow: hidden;

  @container (min-width: 961px) {
    align-self: start;
  }

  @container (max-width: 960px) {
    width: 100%;
  }
`

/** Title, then XP / All. In a narrow rail the toggle drops under the title instead of squeezing it. */
export const Head = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px 8px;
  min-width: 0;
  padding: 10px 12px 8px;
  border-bottom: 1px solid ${theme.colors.border};
`

export const Title = styled.h2`
  margin: 0;
  min-width: 0;
  white-space: nowrap;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: 18px;
  line-height: 1.2;
  color: ${theme.colors.forest};
`

export const ScrollFrame = styled.div`
  position: relative;
  min-height: 0;
  height: 100%;
`

export const Scroll = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  padding: 12px;

  @container (max-width: 960px) {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }
  }
`

/** Top hint that older activity still sits above. The bar itself stays hidden. */
export const MoreAbove = styled.div<{ $on?: boolean }>`
  display: none;

  @container (max-width: 960px) {
    display: block;
    position: absolute;
    z-index: 2;
    inset-inline: 0;
    inset-block-start: 0;
    height: 64px;
    pointer-events: none;
    opacity: ${({ $on }) => ($on ? 1 : 0)};
    transition: opacity ${theme.motion.base} ${theme.motion.ease};
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--c-creamCard) 98%, transparent) 0%,
      color-mix(in srgb, var(--c-creamCard) 55%, transparent) 48%,
      transparent 100%
    );

    &::after {
      content: '';
      position: absolute;
      inset-inline: 12px;
      inset-block-start: 0;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        color-mix(in srgb, var(--c-moss) 40%, transparent) 14%,
        color-mix(in srgb, var(--c-moss) 40%, transparent) 86%,
        transparent 100%
      );
    }
  }
`

export const Message = styled.div<{ $kind?: FeedUpdateKind; $open?: boolean }>`
  position: relative;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  flex: none;
  width: 100%;
  margin: 0;
  padding: 10px 12px;
  border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.border};
  background: color-mix(in srgb, var(--c-creamCard) 88%, transparent);
  color: inherit;
  font: inherit;
  text-align: start;
  text-decoration: none;
  overflow: hidden;
  ${({ $kind }) => $kind && momentSurface($kind)}
  ${({ $open }) =>
    $open &&
    css`
      cursor: pointer;

      &:hover {
        transform: translateY(-1px);
        box-shadow: ${theme.shadow.soft};
      }

      &:focus-visible {
        outline: 2px solid ${theme.colors.moss};
        outline-offset: 2px;
      }
    `}
`

export const Photo = styled.div<{ $scan?: boolean }>`
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: ${theme.radii.pill};
  overflow: hidden;
  background: ${({ $scan }) => ($scan ? theme.colors.forest : theme.colors.chipGreen)};
  color: ${theme.colors.growth};
  font-size: 16px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const Meta = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  gap: 4px;
  min-width: 0;
  /* Clears the corner motion so the scan frame and other marks stay off the words. */
  padding-inline-end: 40px;
`

export const Event = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: ${theme.colors.ink};
  overflow-wrap: anywhere;

  strong {
    font-weight: 700;
  }
`

export const When = styled.span`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  color: ${theme.colors.moss};
`

export const Tag = styled.span<{ $pending: boolean }>`
  padding: 2px 7px;
  border-radius: ${theme.radii.pill};
  background: ${({ $pending }) => ($pending ? theme.colors.chipWarm : theme.colors.growth)};
  color: ${({ $pending }) => ($pending ? theme.colors.warn : theme.colors.forest)};
  font-size: 10px;
  letter-spacing: 0.05em;
`

export const Empty = styled.p`
  margin: auto 0;
  padding: 24px 8px;
  text-align: center;
  font-size: 14px;
  color: ${theme.colors.muted};
`
