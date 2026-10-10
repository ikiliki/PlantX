import styled, { css } from 'styled-components'
import { pressable, riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'
import type { CareIcon } from '../../../../mock/types'
import { careColor } from '../../careKinds'

type Tone = { $tone: CareIcon }

/** Water reads blue, a photo check-in peach: the same tones as the feed and the calendar. Newer kinds use their care colour. */
const FIXED: Partial<Record<CareIcon, { wash: string; edge: string; ink: string }>> = {
  water: { wash: '#e8f3fa', edge: '#8ebcda', ink: '#2A628A' },
  photo: { wash: '#fff1e4', edge: '#e4c29a', ink: '#9A6230' },
}

function toneOf(kind: CareIcon) {
  return (
    FIXED[kind] ?? {
      wash: `color-mix(in srgb, ${careColor(kind)} 12%, var(--c-creamCard))`,
      edge: `color-mix(in srgb, ${careColor(kind)} 45%, transparent)`,
      ink: careColor(kind),
    }
  )
}

export const Root = styled.section`
  display: grid;
  gap: 8px;
  min-width: 0;
  width: 100%;
  padding: 12px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
`

export const Head = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin: 4px 6px 4px;
`

export const Title = styled.h2`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: 22px;
  color: ${theme.colors.forest};
`

export const Count = styled.span`
  display: grid;
  place-items: center;
  min-width: 26px;
  height: 26px;
  padding: 0 8px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.growth};
  font-size: 12px;
  font-weight: 800;
`

export const Rows = styled.ul`
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
`

export const Row = styled.button<Tone>`
  ${pressable}
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
  padding: 8px 10px 8px 8px;
  border: 1px solid ${({ $tone }) => toneOf($tone).edge};
  border-radius: ${theme.radii.md};
  background: linear-gradient(100deg, ${({ $tone }) => toneOf($tone).wash}, ${theme.colors.creamCard} 75%);
  color: ${theme.colors.ink};
  font: inherit;
  text-align: start;
  cursor: pointer;
  animation: ${riseIn} ${theme.motion.base} ${theme.motion.ease} both;

  &:hover {
    border-color: ${({ $tone }) => toneOf($tone).ink};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 2px;
  }
`

export const Thumb = styled.span`
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${theme.colors.chipGreen};

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    object-fit: cover;
  }
`

/** The task kind, pinned to the photo's corner. */
export const Badge = styled.span<Tone>`
  position: absolute;
  inset-inline-end: -5px;
  bottom: -5px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${theme.colors.creamCard};
  color: ${({ $tone }) => toneOf($tone).ink};
  box-shadow: 0 0 0 2px ${({ $tone }) => toneOf($tone).edge};
`

export const Copy = styled.span`
  display: grid;
  gap: 2px;
  min-width: 0;
`

export const Name = styled.span`
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.ink};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const Status = styled.span<{ $late: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${({ $late }) => ($late ? theme.colors.danger : theme.colors.muted)};
`

export const Action = styled.span<Tone>`
  padding: 5px 10px;
  border-radius: ${theme.radii.pill};
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
  ${({ $tone }) => css`
    background: ${toneOf($tone).ink};
    color: ${theme.colors.creamCard};
  `}
`
