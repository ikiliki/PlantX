import styled, { keyframes } from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

const water = theme.colors.water
const metal = theme.colors.metal

export const Root = styled.section`
  container-type: inline-size;
  display: grid;
  gap: 16px;
  min-width: 0;
  width: min(1240px, 100%);
`

export const Split = styled.div`
  display: grid;
  gap: 16px;
  min-width: 0;

  @container (min-width: 900px) {
    grid-template-columns: minmax(0, 1.6fr) minmax(300px, 1fr);
    align-items: start;
  }
`

export const Board = styled.div`
  container-type: inline-size;
  display: grid;
  gap: 16px;
  min-width: 0;
  padding: 16px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};

  @container (max-width: 400px) {
    padding: 12px 10px;
  }
`

/** Phone filters and the Days chip share this pill. Filled when that filter is on. */
export const DaysChip = styled.button<{ $on?: boolean }>`
  ${pressable}
  appearance: none;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  width: max-content;
  gap: 6px;
  min-height: 34px;
  padding: 0 12px;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.chipNeutral)};
  color: ${({ $on }) => ($on ? theme.colors.creamCard : theme.colors.ink)};
  box-shadow: ${({ $on }) => ($on ? 'none' : theme.shadow.soft)};
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`

/** Kind chips sit beside Days and share its gap. */
export const KindRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

/** One column with the task list: chips on a row, the plant picker the width of the list. */
export const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
`

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;

  > select {
    flex: 0 1 220px;
    min-width: 0;
  }

  @container (max-width: 899px) {
    align-items: stretch;

    > select {
      flex: 1 1 100%;
      max-width: none;
    }
  }
`

export const FilterSelect = styled.select`
  display: block;
  flex: 0 1 min(280px, 100%);
  min-width: 0;
  max-width: 100%;
  min-height: 34px;
  padding: 0 32px 0 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard}
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%235D7C4E' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")
    no-repeat right 12px center;
  color: ${theme.colors.ink};
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  appearance: none;

  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 2px;
  }
`

export const Head = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
`

export const Month = styled.h2`
  margin: 0;
  text-align: center;
  font-size: 18px;
  font-weight: 800;
  color: ${theme.colors.ink};
`

export const Nav = styled.button`
  ${pressable}
  appearance: none;
  width: 36px;
  height: 36px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.cream};
  color: ${theme.colors.ink};
  font: inherit;
  font-size: 20px;
  cursor: pointer;
`

export const Week = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
  text-align: center;

  > * {
    min-width: 0;
    overflow: hidden;
  }

  @container (max-width: 400px) {
    font-size: 9px;
    letter-spacing: 0;
  }
`

const dayTrack = '78px'

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-auto-rows: ${dayTrack};
  gap: 4px;

  /* Phone: the month takes about 60% of the screen so the tasks stay in view under it. */
  @container (max-width: 560px) {
    grid-auto-rows: clamp(54px, calc((60svh - 150px) / 6), ${dayTrack});
  }
`

export const Cell = styled.div`
  height: 100%;
  min-height: 0;
`

export const Day = styled.div<{
  $tone?: 'water' | 'photo' | 'mixed'
  $active?: boolean
  $selected?: boolean
}>`
  position: relative;
  display: grid;
  gap: 6px;
  align-content: start;
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;
  padding: 6px 4px 8px;
  overflow: visible;
  border: 2px solid
    ${({ $tone, $active, $selected }) => {
      if ($selected) return theme.colors.forest
      if ($active && $tone === 'photo') return metal
      if ($active && ($tone === 'water' || $tone === 'mixed')) return water
      if ($tone === 'photo') return metal
      if ($tone === 'water' || $tone === 'mixed') return water
      return theme.colors.border
    }};
  border-radius: ${theme.radii.md};
  background: ${({ $tone, $selected }) => {
    if ($selected) return 'linear-gradient(180deg, rgba(207, 234, 120, 0.35) 0%, #F7FAF3 100%)'
    if ($tone === 'water') return 'linear-gradient(180deg, #E8F1FB 0%, #F7FAFD 100%)'
    if ($tone === 'photo') return 'linear-gradient(180deg, #ECEEF0 0%, #F7F7F8 100%)'
    if ($tone === 'mixed')
      return 'linear-gradient(135deg, #E8F1FB 0%, #E8F1FB 48%, #ECEEF0 52%, #ECEEF0 100%)'
    return theme.colors.creamCard
  }};
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;

  &[data-open='true'] {
    z-index: 4;
    border-color: transparent;
    background: transparent;

    [data-lift] {
      display: flex;
    }

    > :not([data-lift]) {
      visibility: hidden;
    }
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 2px;
  }

  @container (max-width: 400px) {
    padding-inline: 2px;
    border-radius: ${theme.radii.sm};
  }
`

export const DayNum = styled.span`
  justify-self: center;
  font-size: 12px;
  font-weight: 700;
  color: ${theme.colors.ink};
`

/** Care done on this day: a small tick in the corner, tinted by kind. */
export const DoneMark = styled.span<{ $kind: 'water' | 'photo' }>`
  position: absolute;
  inset-block-start: 4px;
  inset-inline-end: 4px;
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border-radius: ${theme.radii.pill};
  font-size: 10px;
  font-weight: 900;
  color: ${theme.colors.creamCard};
  background: ${({ $kind }) => ($kind === 'photo' ? theme.colors.warn : theme.colors.info)};
`

export const Icons = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  height: 28px;
  min-width: 0;
`

export const More = styled.span`
  position: absolute;
  z-index: 1;
  top: -6px;
  inset-inline-end: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.creamCard};
  box-shadow: 0 0 0 1px ${theme.colors.creamCard};
  font-size: 9px;
  font-weight: 800;
  line-height: 16px;
  text-align: center;
`

const liftIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

export const Lift = styled.div<{
  $tone?: 'water' | 'photo' | 'mixed'
  $selected?: boolean
}>`
  display: none;
  position: absolute;
  z-index: 2;
  top: -2px;
  bottom: auto;
  inset-inline: -2px;
  align-self: start;
  height: auto;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  max-height: min(280px, 70vh);
  padding: 6px 4px 10px;
  overflow: auto;
  border: 2px solid
    ${({ $tone, $selected }) => {
      if ($selected) return theme.colors.forest
      if ($tone === 'photo') return metal
      if ($tone === 'water' || $tone === 'mixed') return water
      return theme.colors.border
    }};
  border-radius: ${theme.radii.md};
  background: ${({ $tone, $selected }) => {
    if ($selected) return '#F3F7E4'
    if ($tone === 'water') return '#E8F1FB'
    if ($tone === 'photo') return '#ECEEF0'
    if ($tone === 'mixed') return '#E7EEF2'
    return theme.colors.creamCard
  }};
  box-shadow: ${theme.shadow.lift};
  animation: ${liftIn} ${theme.motion.fast} ${theme.motion.ease};
  scrollbar-width: thin;

  ${DayNum} {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  @container (max-width: 400px) {
    padding-inline: 2px;
    border-radius: ${theme.radii.sm};
  }
`

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 2px 4px 4px;

  > span {
    pointer-events: auto;
    transition: transform ${theme.motion.fast} ${theme.motion.ease};
  }

  > span:hover {
    transform: scale(1.08);
  }
`

export const PlantBtn = styled.span<{ $tone: 'water' | 'photo'; $open?: boolean; $stacked?: boolean }>`
  position: relative;
  display: block;
  flex: 0 0 auto;
  width: min(28px, 100%);
  aspect-ratio: 1;
  border: 2px solid ${({ $tone, $open }) => ($open ? ($tone === 'water' ? water : metal) : theme.colors.creamCard)};
  border-radius: 999px;
  overflow: visible;
  background: ${theme.colors.cream};
  box-shadow: ${({ $tone, $stacked }) => {
    const ring = $tone === 'water' ? water : metal
    if (!$stacked) return `0 0 0 1px ${ring}`
    return `0 0 0 1px ${ring}, 0 3px 0 0 ${theme.colors.creamCard}, 0 4px 0 0 ${ring}`
  }};
  pointer-events: none;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 999px;
  }
`

export const PlantKind = styled.span`
  position: absolute;
  inset-inline-end: -2px;
  bottom: -2px;
  display: grid;
  place-items: center;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: ${theme.colors.creamCard};
  box-shadow: 0 0 0 1px rgba(23, 49, 40, 0.12);
  line-height: 0;
`

export const Pop = styled.div`
  position: absolute;
  z-index: 4;
  top: calc(100% + 6px);
  inset-inline-start: 50%;
  transform: translateX(-50%);
  width: max-content;
  max-width: min(280px, 80vw);

  @container (max-width: 720px) {
    inset-inline: 0;
    transform: none;
    width: auto;
    max-width: none;
  }
`

const dropIn = keyframes`
  0% {
    opacity: 0;
    transform: translate(-50%, -92px) scale(1.35) rotate(-12deg);
  }
  55% {
    opacity: 1;
    transform: translate(-50%, 6px) scale(1) rotate(4deg);
  }
  75% {
    transform: translate(-50%, -8px) scale(1.08) rotate(-2deg);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, 0) scale(1) rotate(0deg);
  }
`

export const DropIcon = styled.div<{ $kind: 'water' | 'photo' }>`
  position: absolute;
  z-index: 5;
  left: 50%;
  top: 28%;
  pointer-events: none;
  animation: ${dropIn} 720ms cubic-bezier(0.22, 1.2, 0.36, 1) both;
  filter: drop-shadow(0 10px 16px ${({ $kind }) => ($kind === 'water' ? 'rgba(59, 124, 201, 0.45)' : 'rgba(139, 146, 154, 0.45)')});
`

export const DayPanel = styled.section`
  display: grid;
  gap: 12px;
  min-width: 0;
  padding: 14px 16px 16px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};

  /* Phone: the filters live inside this card; the plant picker spans its width. */
  ${Toolbar} > select {
    flex: 1 1 100%;
    max-width: none;
  }

  @container (max-width: 400px) {
    padding: 12px 10px;
  }
`

export const DayPanelHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 800;
    color: ${theme.colors.ink};
  }

  p {
    margin: 0;
    font-size: 12px;
    color: ${theme.colors.muted};
  }
`

export const DayList = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr));
  min-width: 0;
`

export const EmptyDay = styled.p`
  margin: 0;
  color: ${theme.colors.muted};
  font-size: 14px;
`
