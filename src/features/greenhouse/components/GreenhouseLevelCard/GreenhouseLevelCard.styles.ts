import { Link } from 'react-router-dom'
import styled, { css, keyframes } from 'styled-components'
import { blurred } from '../../../../components/Skeleton/Skeleton'
import { growX, pressable, riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

/** A slow band of light crossing the XP fill, then a long rest. */
const sheen = keyframes`
  0% { transform: translateX(-120%); }
  30%, 100% { transform: translateX(120%); }
`

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--c-growth) 90%, transparent); }
  70% { box-shadow: 0 0 0 18px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
`

const pop = keyframes`
  0% { opacity: 0; transform: translateY(6px) scale(0.8); }
  20% { opacity: 1; transform: translateY(0) scale(1.06); }
  30% { transform: scale(1); }
  85% { opacity: 1; }
  100% { opacity: 0; }
`

/** Wraps the guest's level-card skeleton so it reads as out of reach. */
export const Blurred = styled.div`
  ${blurred}
`

/** The greenhouse page header: full width, sized by its own container. */
export const Root = styled.aside<{ $celebrate: boolean }>`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: 14px 16px;
  border-radius: ${theme.radii.lg};
  background:
    radial-gradient(70% 120% at 100% 0%, color-mix(in srgb, var(--c-growth) 40%, transparent), transparent 65%),
    ${theme.colors.chipGreen};
  box-shadow: ${theme.shadow.card};
  color: ${theme.colors.forest};
  container-type: inline-size;
  animation: ${riseIn} ${theme.motion.base} ${theme.motion.ease} both;

  ${({ $celebrate }) =>
    $celebrate &&
    css`
      box-shadow:
        0 0 0 2px ${theme.colors.growth},
        ${theme.shadow.card};
    `}

  @container (min-width: 640px) {
    padding: 16px 22px;
  }
`

/**
 * Phone: ring · name and XP · buttons, then the chips, then what a button opened.
 * Wide: ring · name, bar and XP · chips · ? · place tile, in one row.
 */
export const Inner = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  grid-template-areas:
    'ring copy actions'
    'chips chips chips'
    'panel panel panel';
  align-items: center;
  gap: 12px 14px;
  min-width: 0;

  > :first-child {
    grid-area: ring;
  }

  @container (min-width: 640px) {
    grid-template-columns: auto minmax(0, 1fr) auto auto auto;
    grid-template-areas:
      'ring copy chips actions end'
      'panel panel panel panel panel';
    column-gap: 22px;
  }
`

export const Copy = styled.div`
  grid-area: copy;
  display: grid;
  gap: 4px;
  min-width: 0;
`

export const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 2px 10px;
  min-width: 0;
`

export const Rank = styled.strong`
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: ${theme.text.lg};
  line-height: 1.1;
  color: ${theme.colors.forest};
  overflow-wrap: anywhere;

  @container (min-width: 640px) {
    font-size: ${theme.text.xl};
  }
`

export const Xp = styled.span`
  font-size: ${theme.text.xs};
  font-weight: 700;
  color: ${theme.colors.muted};
  font-variant-numeric: tabular-nums;
`

/** "330 XP to Gardener": the one line that says what comes next. */
export const Next = styled.span`
  font-size: ${theme.text.sm};
  font-weight: 700;
  color: ${theme.colors.ink};
  font-variant-numeric: tabular-nums;
`

export const Burst = styled.span`
  position: absolute;
  z-index: 1;
  inset-inline-end: 16px;
  top: -13px;
  padding: 5px 12px;
  box-shadow: ${theme.shadow.soft};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.growth};
  color: ${theme.colors.onGrowth};
  font-size: 12px;
  font-weight: 800;
  animation:
    ${pop} 4s ${theme.motion.ease} both,
    ${pulse} 1.2s ${theme.motion.ease} 2;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

/** Wide only: the ring already shows the progress on a phone. */
export const Bar = styled.div`
  display: none;
  height: 10px;
  padding: 2px;
  border-radius: ${theme.radii.pill};
  background: color-mix(in srgb, var(--c-creamCard) 75%, transparent);
  box-shadow: inset 0 1px 2px color-mix(in srgb, var(--c-forest) 12%, transparent);
  overflow: hidden;

  @container (min-width: 640px) {
    display: block;
    max-width: 420px;
  }
`

/**
 * The fill grows in slowly with the ring, then rests. Every few seconds a soft light passes over it,
 * slow enough to read as daylight, not as loading.
 */
export const BarFill = styled.div`
  position: relative;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
  background: linear-gradient(90deg, ${theme.colors.moss}, ${theme.colors.forestSoft});
  transform-origin: left center;
  animation: ${growX} 1.8s cubic-bezier(0.22, 1, 0.36, 1) 300ms both;
  transition: width ${theme.motion.slow} ${theme.motion.ease};

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      100deg,
      transparent 20%,
      color-mix(in srgb, var(--c-creamCard) 55%, transparent) 50%,
      transparent 80%
    );
    transform: translateX(-120%);
    animation: ${sheen} 8s ease-in-out 2.4s infinite;
  }

  [dir='rtl'] & {
    transform-origin: right center;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;

    &::after {
      animation: none;
    }
  }
`

/** Plants, needs care, care done: the same icon chips on a phone and wide. */
export const Chips = styled.div`
  grid-area: chips;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
`

const chipTone = {
  plant: css`
    background: color-mix(in srgb, var(--c-creamCard) 70%, transparent);
    color: ${theme.colors.forest};
    svg {
      color: ${theme.colors.moss};
    }
  `,
  care: css`
    background: color-mix(in srgb, var(--c-creamCard) 70%, transparent);
    color: ${theme.colors.forest};
    svg {
      color: ${theme.colors.water};
    }
  `,
}

const chipBase = css`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 30px;
  padding: 0 11px;
  border-radius: ${theme.radii.pill};
  font-size: ${theme.text.xs};
  font-weight: 800;
  white-space: nowrap;
`

export const Chip = styled.span<{ $tone: 'plant' | 'care' }>`
  ${chipBase}
  ${({ $tone }) => chipTone[$tone]}
`

/** Needs care today: warm, and a link to Tasks. */
export const DueChip = styled(Link)`
  ${pressable}
  ${chipBase}
  background: ${theme.colors.chipWarm};
  color: ${theme.colors.warn};
  text-decoration: none;

  &::after {
    content: ' →';
  }
  [dir='rtl'] &::after {
    content: ' ←';
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 2px;
  }
`

/** The "?" (and, on a phone, the place pin). */
export const TopActions = styled.div`
  grid-area: actions;
  display: flex;
  align-self: start;
  gap: 6px;

  @container (min-width: 640px) {
    align-self: center;
  }
`

const roundButton = css`
  ${pressable}
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border-radius: ${theme.radii.pill};
  font: inherit;
  cursor: pointer;

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }

  /* A finger-sized target. */
  &::after {
    content: '';
    position: absolute;
    inset: -7px;
  }
`

/** "?": how levels work. */
export const InfoButton = styled.button<{ $on: boolean }>`
  ${roundButton}
  border: 1.5px solid ${({ $on }) => ($on ? theme.colors.forest : theme.colors.border)};
  background: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.creamCard)};
  color: ${({ $on }) => ($on ? theme.colors.creamCard : theme.colors.forest)};
  font-size: 15px;
  font-weight: 800;
  line-height: 1;
`

/** Phone only, while the greenhouse place is unknown: an orange pin that opens the Set your place tile. */
export const PlaceButton = styled.button<{ $on: boolean }>`
  ${roundButton}
  border: 1.5px solid ${({ $on }) => ($on ? theme.colors.warn : 'color-mix(in srgb, var(--c-warn) 35%, transparent)')};
  background: ${({ $on }) => ($on ? theme.colors.warn : theme.colors.chipWarm)};
  color: ${({ $on }) => ($on ? theme.colors.creamCard : theme.colors.warn)};

  @container (min-width: 640px) {
    display: none;
  }
`

/**
 * The owner's Set your place tile. Wide: at the end of the row. A phone keeps it behind the pin (`Panel`).
 * `$loose`: shown on its own when the level card is off.
 */
export const End = styled.div<{ $loose?: boolean }>`
  grid-area: end;
  display: ${({ $loose }) => ($loose ? 'flex' : 'none')};
  min-width: 0;

  & > * {
    width: min(240px, 100%);
  }

  @container (min-width: 640px) {
    display: flex;
    padding-inline-start: 18px;
    border-inline-start: 1px solid ${theme.colors.border};
  }
`

/** What a button opened (the level rules, or on a phone the place tile), under the row. */
export const Panel = styled.div`
  grid-area: panel;
  display: grid;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid ${theme.colors.border};
  animation: ${riseIn} ${theme.motion.base} ${theme.motion.ease} both;
`

export const PanelRules = styled.ul`
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
  color: ${theme.colors.ink};
`
