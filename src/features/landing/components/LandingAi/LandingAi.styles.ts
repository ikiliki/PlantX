import styled, { css, keyframes } from 'styled-components'
import { theme } from '../../../../theme/tokens'

const fill = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`

export const Band = styled.section`
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: 56px ${theme.space.md};
  scroll-margin-top: 72px;

  @container landing (min-width: 900px) {
    padding: 88px 28px;
  }
`

export const Head = styled.div`
  display: grid;
  gap: 12px;
  max-width: 62ch;
  margin-bottom: 32px;
`

export const Kicker = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Title = styled.h2`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: 400;
  font-size: clamp(32px, 5cqi, 48px);
  line-height: 1.05;
  color: ${theme.colors.forest};
`

export const Lead = styled.p`
  margin: 0;
  color: ${theme.colors.muted};
  font-size: 17px;
  line-height: 1.6;
`

export const Stage = styled.div`
  display: grid;
  gap: 24px;
  align-items: center;
  min-width: 0;

  @container landing (min-width: 900px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 420px);
    gap: 56px;
  }
`

export const Steps = styled.div`
  display: grid;
  gap: 10px;
  min-width: 0;
`

export const Step = styled.button<{ $on: boolean; $auto: boolean }>`
  position: relative;
  display: grid;
  gap: 4px;
  width: 100%;
  padding: 16px 18px;
  text-align: start;
  font: inherit;
  color: ${theme.colors.ink};
  cursor: pointer;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${({ $on }) => ($on ? theme.colors.forest : theme.colors.border)};
  background: ${({ $on }) => ($on ? theme.colors.creamCard : 'transparent')};
  box-shadow: ${({ $on }) => ($on ? theme.shadow.card : 'none')};
  overflow: hidden;
  transition:
    background ${theme.motion.base} ${theme.motion.ease},
    border-color ${theme.motion.base} ${theme.motion.ease},
    box-shadow ${theme.motion.base} ${theme.motion.ease};

  strong {
    font-family: ${theme.fonts.display};
    font-weight: 400;
    font-size: 22px;
    color: ${theme.colors.forest};
  }

  &:hover {
    border-color: ${theme.colors.moss};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 2px;
  }

  /* Progress line while the steps advance on their own. */
  &::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    height: 3px;
    background: ${theme.colors.growth};
    transform-origin: left;
    transform: scaleX(0);
    ${({ $auto }) =>
      $auto &&
      css`
        animation: ${fill} 4200ms linear both;
      `}
  }

  [dir='rtl'] &::after {
    transform-origin: right;
  }
`

export const StepIndex = styled.span`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const StepBody = styled.span`
  color: ${theme.colors.muted};
  font-size: 15px;
  line-height: 1.55;
`

export const Shot = styled.div`
  position: relative;
  justify-self: center;
  width: min(420px, 100%);
  aspect-ratio: 722 / 960;
  border-radius: 28px;
  overflow: hidden;
  background: ${theme.colors.chipNeutral};
  box-shadow: ${theme.shadow.lift};
  border: 1px solid ${theme.colors.border};

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    opacity: 0;
    transition: opacity ${theme.motion.slow} ${theme.motion.ease};
    user-select: none;
  }

  img[data-on='true'] {
    opacity: 1;
  }
`
