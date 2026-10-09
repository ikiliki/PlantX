import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'
import type { FeedUpdateKind } from '../../../../mock/types'
import { kindInk } from '../../../feed/components/ActivityMoment/ActivityMoment.styles'

type Variant = 'rail' | 'sheet'

/** Rail: a calm card beside the shelf. Sheet: no card of its own, it fills the phone dialog. */
export const Root = styled.aside<{ $height?: number; $variant: Variant }>`
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
  overflow: hidden;

  ${({ $variant, $height }) =>
    $variant === 'sheet'
      ? `
    width: 100%;
    height: min(64svh, 560px);
  `
      : `
    width: min(340px, 100%);
    height: ${$height ? `${$height}px` : 'min(56svh, 460px)'};
    min-height: ${$height ? `${$height}px` : '240px'};
    max-height: ${$height ? `${$height}px` : 'min(56svh, 460px)'};
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.creamCard};
    box-shadow: ${theme.shadow.card};
  `}

  @container (min-width: 961px) {
    align-self: start;
  }

  @container (max-width: 960px) {
    width: 100%;
  }
`

/** Title, then XP / All. In a narrow rail the toggle drops under the title instead of squeezing it. */
export const Head = styled.div<{ $variant: Variant }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
  padding: ${({ $variant }) => ($variant === 'sheet' ? '0 0 10px' : '14px 16px 10px')};
`

export const Title = styled.h2`
  margin: 0;
  min-width: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: ${theme.text.md};
  line-height: 1.2;
  color: ${theme.colors.ink};
`

export const Scroll = styled.div<{ $variant: Variant }>`
  display: grid;
  align-content: start;
  gap: 14px;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: ${({ $variant }) => ($variant === 'sheet' ? '2px 0 12px' : '2px 10px 14px')};
  scrollbar-width: thin;
`

export const Day = styled.section`
  display: grid;
  gap: 4px;
`

/** Today / Yesterday / Sat 4 Oct: sticks to the top while its rows scroll under it. */
export const DayLabel = styled.h3`
  position: sticky;
  top: 0;
  z-index: 1;
  margin: 0;
  padding: 4px 6px;
  font-size: ${theme.text.xs};
  font-weight: 800;
  color: ${theme.colors.muted};
  background: ${theme.colors.creamCard};
`

export const Rows = styled.ul`
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;

  > li + li {
    border-top: 1px solid ${theme.colors.border};
  }
`

export const Row = styled.div<{ $open?: boolean }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 6px;
  border: 0;
  border-radius: ${theme.radii.sm};
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: ${({ $open }) => ($open ? 'pointer' : 'default')};
  transition: background ${theme.motion.fast} ease;

  &:hover {
    background: ${({ $open }) => ($open ? theme.colors.chipNeutral : 'transparent')};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: -2px;
  }
`

export const Thumb = styled.span<{ $scan?: boolean }>`
  position: relative;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: ${theme.radii.sm};
  background: ${({ $scan }) => ($scan ? theme.colors.chipNeutral : theme.colors.chipGreen)};
  color: ${theme.colors.forest};
  font-size: 16px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
  }
`

/** The kind's glyph in a small coin at the thumb's bottom corner. */
export const Badge = styled.span<{ $kind: FeedUpdateKind }>`
  position: absolute;
  inset-block-end: -4px;
  inset-inline-end: -4px;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  box-shadow: 0 0 0 2px ${theme.colors.creamCard};
  color: ${({ $kind }) => kindInk($kind)};

  > * {
    transform: scale(0.8);
  }
`

export const Text = styled.span`
  display: grid;
  gap: 1px;
  min-width: 0;
`

export const Name = styled.span`
  font-size: ${theme.text.sm};
  font-weight: 800;
  color: ${theme.colors.ink};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const Label = styled.span`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: ${theme.text.xs};
  line-height: 1.35;
  color: ${theme.colors.muted};
  overflow-wrap: anywhere;
`

export const Side = styled.span`
  display: grid;
  justify-items: end;
  gap: 3px;
`

export const Time = styled.time`
  font-size: 11px;
  font-weight: 700;
  color: ${theme.colors.muted};
  font-variant-numeric: tabular-nums;
`

export const Tag = styled.span<{ $pending: boolean }>`
  display: inline-block;
  margin-inline-start: 6px;
  padding: 0 6px;
  border-radius: ${theme.radii.pill};
  font-size: 10px;
  font-weight: 800;
  background: ${({ $pending }) => ($pending ? theme.colors.chipWarm : theme.colors.growth)};
  color: ${({ $pending }) => ($pending ? theme.colors.warn : theme.colors.onGrowth)};
`

export const Empty = styled.p`
  margin: 0;
  padding: 28px 12px;
  text-align: center;
  font-size: ${theme.text.sm};
  color: ${theme.colors.muted};
`
