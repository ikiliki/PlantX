import styled, { css, keyframes } from 'styled-components'
import { blurred } from '../../../../components/Skeleton/Skeleton'
import { pressable, riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(207, 234, 120, 0.9); }
  70% { box-shadow: 0 0 0 18px rgba(207, 234, 120, 0); }
  100% { box-shadow: 0 0 0 0 rgba(207, 234, 120, 0); }
`

const pop = keyframes`
  0% { opacity: 0; transform: translateY(6px) scale(0.8); }
  20% { opacity: 1; transform: translateY(0) scale(1.06); }
  30% { transform: scale(1); }
  85% { opacity: 1; }
  100% { opacity: 0; }
`

/** The greenhouse page header: full width, sized by its own container (stacked narrow, one row wide). */
/** Wraps the guest's level-card skeleton so it reads as out of reach. */
export const Blurred = styled.div`
  ${blurred}
`

export const Root = styled.aside<{ $celebrate: boolean }>`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: 16px 18px 14px;
  border-radius: ${theme.radii.lg};
  background:
    radial-gradient(120% 90% at 0% 0%, rgba(207, 234, 120, 0.5), rgba(255, 254, 250, 0) 60%),
    ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadow.card};
  color: ${theme.colors.forest};
  container-type: inline-size;
  animation: ${riseIn} ${theme.motion.base} ${theme.motion.ease} both;

  ${({ $celebrate }) =>
    $celebrate &&
    css`
      border-color: ${theme.colors.growth};
    `}
`

export const Inner = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'top'
    'bar'
    'tally'
    'end'
    'rules';
  gap: 12px 14px;
  align-items: center;
  min-width: 0;

  @container (min-width: 640px) {
    grid-template-columns: minmax(200px, 280px) minmax(0, 1fr) auto;
    grid-template-areas:
      'top side end'
      'bar side end'
      'rules rules rules';
    column-gap: 28px;
    row-gap: 8px;
  }
`

/** On desktop the counts sit to the right of the level block. */
export const Side = styled.div`
  display: contents;

  @container (min-width: 640px) {
    display: flex;
    grid-area: side;
    align-items: center;
    justify-content: flex-start;
    gap: 18px;
    padding-inline-start: 48px;
  }
`

/**
 * The owner's tiles (AI scans, set your place). Wide: a column at the end of the card. Narrow (a phone) they
 * live behind the top-row buttons instead (`Panel`). `$loose`: shown on its own when the level card is off.
 */
export const End = styled.div<{ $loose?: boolean }>`
  grid-area: end;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 8px;
  min-width: 0;
  padding-top: ${({ $loose }) => ($loose ? 0 : '12px')};
  border-top: ${({ $loose }) => ($loose ? 'none' : `1px solid ${theme.colors.border}`)};

  & > * {
    flex: 1 1 200px;
  }

  @container (max-width: 639px) {
    display: ${({ $loose }) => ($loose ? 'flex' : 'none')};
  }

  @container (min-width: 640px) {
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-self: stretch;
    padding-top: 0;
    padding-inline-start: 18px;
    border-top: none;
    border-inline-start: 1px solid ${theme.colors.border};

    & > * {
      flex: none;
      width: min(240px, 100%);
    }
  }
`

export const Top = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  grid-area: top;
`

export const Progress = styled.div`
  min-width: 0;
  grid-area: bar;
`

export const TopCopy = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
`

export const Rank = styled.strong`
  font-family: ${theme.fonts.display};
  font-weight: 400;
  font-size: 24px;
  line-height: 1.1;
  color: ${theme.colors.forest};
  overflow-wrap: anywhere;
`

export const Xp = styled.span`
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.muted};
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
  color: ${theme.colors.forest};
  font-size: 12px;
  font-weight: 800;
  animation:
    ${pop} 4s ${theme.motion.ease} both,
    ${pulse} 1.2s ${theme.motion.ease} 2;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const Bar = styled.div`
  height: 8px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.track};
  overflow: hidden;
`

export const BarFill = styled.div`
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, ${theme.colors.moss}, ${theme.colors.growth});
  transition: width ${theme.motion.slow} ${theme.motion.ease};
`

export const Next = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 6px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.muted};
`

export const TallyRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  grid-area: tally;

  @container (min-width: 640px) {
    align-self: center;
    justify-self: end;
  }
`

export const Tally = styled.span<{ $tone: 'plant' | 'care' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: ${theme.radii.pill};
  font-size: 12px;
  font-weight: 700;
  background: ${({ $tone }) => ($tone === 'plant' ? theme.colors.chipGreen : 'rgba(60, 107, 143, 0.12)')};
  color: ${({ $tone }) => ($tone === 'plant' ? theme.colors.forest : theme.colors.info)};
`

/** "?" at the end of the level line, same size and gray as that line. Padding only grows the tap area. */
/** Small circled (?) after the XP-to-next-level line; opens the level rules. */
export const How = styled.button<{ $on: boolean }>`
  ${pressable}

  /* On a phone the "!" in the top row covers the rules. */
  @container (max-width: 639px) {
    display: none;
  }
  position: relative;
  flex: none;
  display: inline-grid;
  place-items: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: 1.5px solid currentColor;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.chipGreen : 'none')};
  color: ${({ $on }) => ($on ? theme.colors.ink : theme.colors.muted)};
  font: inherit;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;

  /* A finger-sized target around the small circle. */
  &::after {
    content: '';
    position: absolute;
    inset: -12px;
  }

  &:hover {
    color: ${theme.colors.ink};
  }
`

export const HowList = styled.ul`
  grid-area: rules;
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 10px 0 0;
  border-top: 1px solid ${theme.colors.border};
  list-style: none;
  font-size: 13px;
  color: ${theme.colors.ink};
  animation: ${riseIn} ${theme.motion.base} ${theme.motion.ease} both;
`

/** Phone only: the top-row buttons, at the end of the level row. */
export const TopActions = styled.div`
  display: none;
  align-self: flex-start;
  gap: 6px;
  margin-inline-start: auto;

  @container (max-width: 639px) {
    display: flex;
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

/** "!": the AI scans left and the level rules. */
export const InfoButton = styled.button<{ $on: boolean }>`
  ${roundButton}
  border: 1.5px solid ${({ $on }) => ($on ? theme.colors.forest : theme.colors.border)};
  background: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.creamCard)};
  color: ${({ $on }) => ($on ? theme.colors.creamCard : theme.colors.forest)};
  font-size: 15px;
  font-weight: 800;
  line-height: 1;
`

/** Orange pin, only while the greenhouse place is unknown: opens the Set your place tile. */
export const PlaceButton = styled.button<{ $on: boolean }>`
  ${roundButton}
  border: 1.5px solid ${({ $on }) => ($on ? theme.colors.warn : 'rgba(154, 107, 31, 0.35)')};
  background: ${({ $on }) => ($on ? theme.colors.warn : theme.colors.chipWarm)};
  color: ${({ $on }) => ($on ? theme.colors.creamCard : theme.colors.warn)};
`

/** Phone only: what a top-row button opened, under the counts. */
export const Panel = styled.div`
  grid-area: end;
  display: grid;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid ${theme.colors.border};
  animation: ${riseIn} ${theme.motion.base} ${theme.motion.ease} both;

  @container (min-width: 640px) {
    display: none;
  }
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
