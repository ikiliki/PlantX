import styled, { css, keyframes } from 'styled-components'
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
  gap: 12px;
  min-width: 0;

  @container (min-width: 640px) {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr) auto;
    align-items: center;
    column-gap: 28px;
  }
`

export const Top = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
`

export const Progress = styled.div`
  min-width: 0;
`

export const TopCopy = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
`

export const Label = styled.span`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
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
  margin: 6px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.muted};
`

export const TallyRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
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

/** Small "?" in the top row; opens the rules under the counts. */
export const How = styled.button<{ $on: boolean }>`
  ${pressable}
  flex: none;
  align-self: flex-start;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  margin-inline-start: auto;
  padding: 0;
  border: 1px solid ${({ $on }) => ($on ? theme.colors.forest : theme.colors.border)};
  border-radius: 50%;
  background: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.creamCard)};
  color: ${({ $on }) => ($on ? theme.colors.cream : theme.colors.forest)};
  font: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
`

export const HowList = styled.ul`
  grid-column: 1 / -1;
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
