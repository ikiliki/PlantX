import styled, { css, keyframes } from 'styled-components'
import { theme } from '../../../../theme/tokens'

const rise = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
`

const scan = keyframes`
  0% { inset-block-start: 8%; }
  50% { inset-block-start: 86%; }
  100% { inset-block-start: 8%; }
`

const fill = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`

const ripple = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(60, 107, 143, 0.45); }
  100% { box-shadow: 0 0 0 12px rgba(60, 107, 143, 0); }
`

const sway = keyframes`
  0%, 100% { transform: rotate(-1.2deg) scale(1.02); }
  50% { transform: rotate(1.2deg) scale(1.04); }
`

export const Root = styled.section`
  container-type: inline-size;
  display: grid;
  gap: ${theme.space.lg};
  min-width: 0;
  padding: clamp(18px, 4cqi, 28px);
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background:
    radial-gradient(circle at 100% 0%, rgba(207, 234, 120, 0.28), transparent 42%),
    ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.card};
  animation: ${rise} ${theme.motion.slow} ${theme.motion.ease} both;

  @container (min-width: 620px) {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
    align-items: center;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const Copy = styled.div`
  display: grid;
  gap: 10px;
  min-width: 0;
`

export const Eyebrow = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Title = styled.h1`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: clamp(28px, 6cqi, 40px);
  line-height: 1.08;
  color: ${theme.colors.forest};
`

export const Lead = styled.p`
  margin: 0;
  max-width: 46ch;
  font-size: 15px;
  line-height: 1.55;
  color: ${theme.colors.muted};
`

export const Steps = styled.ol`
  display: grid;
  gap: 6px;
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
`

export const Step = styled.li`
  min-width: 0;
`

export const StepButton = styled.button<{ $on: boolean }>`
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  width: 100%;
  padding: 10px 12px;
  overflow: hidden;
  border: 1px solid ${(p) => (p.$on ? theme.colors.moss : 'transparent')};
  border-radius: ${theme.radii.md};
  background: ${(p) => (p.$on ? theme.colors.chipGreen : 'transparent')};
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
  transition: background ${theme.motion.base} ${theme.motion.ease}, border-color ${theme.motion.base} ${theme.motion.ease};

  &:hover {
    background: ${(p) => (p.$on ? theme.colors.chipGreen : theme.colors.chipNeutral)};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }
`

export const StepNumber = styled.span<{ $on: boolean }>`
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: ${theme.radii.pill};
  background: ${(p) => (p.$on ? theme.colors.forest : theme.colors.track)};
  color: ${(p) => (p.$on ? theme.colors.growth : theme.colors.forest)};
  font-size: 13px;
  font-weight: 800;
  transition: background ${theme.motion.base} ${theme.motion.ease}, color ${theme.motion.base} ${theme.motion.ease};
`

export const StepTitle = styled.span`
  display: block;
  font-size: 15px;
  font-weight: 750;
  color: ${theme.colors.forest};
`

export const StepBody = styled.span`
  display: block;
  margin-top: 2px;
  font-size: 13px;
  line-height: 1.45;
  color: ${theme.colors.muted};
`

/** How long until the next step, along the bottom of the active one. */
export const Progress = styled.span<{ $ms: number }>`
  position: absolute;
  inset-inline: 0;
  inset-block-end: 0;
  height: 3px;
  background: ${theme.colors.moss};
  transform-origin: left;
  animation: ${fill} ${(p) => p.$ms}ms linear both;

  [dir='rtl'] & {
    transform-origin: right;
  }
`

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
`

export const Note = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${theme.colors.muted};
`

export const Stage = styled.div`
  position: relative;
  display: grid;
  justify-items: center;
  gap: 10px;
  min-width: 0;

  @container (max-width: 619px) {
    order: -1;
  }
`

export const Frame = styled.div`
  position: relative;
  width: min(100%, 340px);
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.chipGreen};
  box-shadow: ${theme.shadow.lift};

  @container (max-width: 619px) {
    width: min(100%, 300px);
    aspect-ratio: 5 / 4;
  }
`

export const Photo = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: ${sway} 6s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const StageTag = styled.span`
  position: absolute;
  inset-block-start: 12px;
  inset-inline-start: 12px;
  padding: 4px 10px;
  border-radius: ${theme.radii.pill};
  background: rgba(255, 254, 250, 0.9);
  color: ${theme.colors.forest};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`

const shown = (on: boolean) => css`
  opacity: ${on ? 1 : 0};
  transform: ${on ? 'none' : 'translateY(10px)'};
  transition: opacity ${theme.motion.slow} ${theme.motion.ease}, transform ${theme.motion.slow} ${theme.motion.spring};
`

export const ScanLine = styled.span<{ $on: boolean }>`
  position: absolute;
  inset-inline: 8%;
  height: 2px;
  border-radius: 2px;
  background: ${theme.colors.growth};
  box-shadow: 0 0 16px 4px rgba(207, 234, 120, 0.75);
  opacity: ${(p) => (p.$on ? 1 : 0)};
  transition: opacity ${theme.motion.base} ${theme.motion.ease};
  animation: ${scan} 2.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    inset-block-start: 50%;
  }
`

const chip = css`
  position: absolute;
  inset-inline: 12px;
  inset-block-end: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: ${theme.radii.md};
  background: rgba(255, 254, 250, 0.95);
  box-shadow: ${theme.shadow.card};
  color: ${theme.colors.forest};
`

export const ScanText = styled.span<{ $on: boolean }>`
  ${chip}
  ${(p) => shown(p.$on)}
  font-size: 13px;
  font-weight: 700;
`

export const AiChip = styled.span<{ $on: boolean }>`
  ${chip}
  ${(p) => shown(p.$on)}
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;

  small {
    font-size: 11px;
    font-weight: 800;
    color: ${theme.colors.aiBlue};
  }

  b {
    font-family: ${theme.fonts.display};
    font-weight: ${theme.fonts.displayWeight};
    font-size: 20px;
  }
`

export const CareChip = styled.span<{ $on: boolean }>`
  ${chip}
  ${(p) => shown(p.$on)}
  font-size: 14px;

  .drop {
    flex: none;
    width: 14px;
    height: 14px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    background: ${theme.colors.info};
    animation: ${ripple} 1.6s ease-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .drop {
      animation: none;
    }
  }
`

export const Pause = styled.button`
  padding: 4px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.forest};
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }
`
