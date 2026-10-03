import styled, { css } from 'styled-components'
import { theme } from '../../theme/tokens'

type StepState = 'done' | 'current' | 'next'

export const Root = styled.nav`
  position: relative;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  container-type: inline-size;
`

/** Runs between the first and last dot centers. */
export const Track = styled.div`
  position: absolute;
  inset-block-start: 15px;
  inset-inline: calc(100% / var(--steps, 5) / 2);
  height: 2px;
  border-radius: 2px;
  background: ${theme.colors.track};
  overflow: hidden;
`

export const Fill = styled.div`
  width: 100%;
  height: 100%;
  background: ${theme.colors.forest};
  transform-origin: left center;
  transition: transform ${theme.motion.slow} ${theme.motion.ease};

  [dir='rtl'] & {
    transform-origin: right center;
  }
`

export const Item = styled.button<{ $state: StepState }>`
  position: relative;
  display: grid;
  justify-items: center;
  gap: 6px;
  min-width: 0;
  padding: 0 2px;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
`

export const Dot = styled.span<{ $state: StepState; $warn?: boolean }>`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: ${theme.radii.pill};
  font-size: 13px;
  font-weight: 800;
  transition:
    background ${theme.motion.base} ${theme.motion.ease},
    color ${theme.motion.base} ${theme.motion.ease},
    transform ${theme.motion.base} ${theme.motion.spring},
    box-shadow ${theme.motion.base} ${theme.motion.ease};

  ${({ $state }) =>
    $state === 'done'
      ? css`
          background: ${theme.colors.forest};
          color: ${theme.colors.growth};
        `
      : $state === 'current'
        ? css`
            background: ${theme.colors.growth};
            color: ${theme.colors.forest};
            box-shadow: 0 0 0 5px ${theme.colors.chipGreen};
            transform: scale(1.08);
          `
        : css`
            background: ${theme.colors.creamCard};
            color: ${theme.colors.muted};
            box-shadow: inset 0 0 0 1px ${theme.colors.border};
          `}

  ${({ $warn, $state }) =>
    $warn &&
    css`
      background: ${theme.colors.chipWarm};
      color: ${theme.colors.warn};
      box-shadow:
        ${$state === 'current' ? `0 0 0 5px ${theme.colors.chipWarm},` : ''}
        inset 0 0 0 1.5px ${theme.colors.warn};
    `}
`

export const Label = styled.span<{ $state: StepState; $warn?: boolean }>`
  max-width: 100%;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.2;
  text-align: center;
  overflow-wrap: anywhere;
  color: ${({ $state, $warn }) => ($warn ? theme.colors.warn : $state === 'next' ? theme.colors.muted : theme.colors.forest)};

  @container (max-width: 420px) {
    font-size: 10px;
    letter-spacing: 0;
  }
`
