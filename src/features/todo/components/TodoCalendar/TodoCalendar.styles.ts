import styled, { keyframes } from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

const water = '#3B7CC9'
const metal = '#8B929A'

export const Root = styled.section`
  display: grid;
  gap: 16px;
  min-width: 0;
  width: min(960px, 100%);
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

export const Filters = styled.div`
  display: grid;
  gap: 10px;
  min-width: 0;
`

export const FilterRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
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

export const FilterLabel = styled.span`
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Chip = styled.button<{ $on?: boolean; $tone?: 'water' | 'photo' }>`
  ${pressable}
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid
    ${({ $on, $tone }) => {
      if (!$on) return theme.colors.border
      if ($tone === 'photo') return metal
      if ($tone === 'water') return water
      return theme.colors.forest
    }};
  border-radius: ${theme.radii.pill};
  background: ${({ $on, $tone }) => {
    if (!$on) return theme.colors.creamCard
    if ($tone === 'photo') return metal
    if ($tone === 'water') return water
    return theme.colors.forest
  }};
  color: ${({ $on }) => ($on ? theme.colors.creamCard : theme.colors.ink)};
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;

  img {
    width: 20px;
    height: 20px;
    border-radius: 999px;
    object-fit: cover;
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

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
`

export const Cell = styled.div`
  min-height: 78px;
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
  min-height: 78px;
  min-width: 0;
  padding: 6px 4px 8px;
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

export const Icons = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  min-width: 0;
`

export const PlantBtn = styled.span<{ $tone: 'water' | 'photo'; $open?: boolean }>`
  position: relative;
  display: block;
  flex: 0 0 auto;
  width: min(28px, 100%);
  aspect-ratio: 1;
  border: 2px solid ${({ $tone, $open }) => ($open ? ($tone === 'water' ? water : metal) : theme.colors.creamCard)};
  border-radius: 999px;
  overflow: visible;
  background: ${theme.colors.cream};
  box-shadow: ${({ $tone }) => `0 0 0 1px ${$tone === 'water' ? water : metal}`};
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
