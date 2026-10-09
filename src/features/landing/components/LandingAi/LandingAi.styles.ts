import styled, { css, keyframes } from 'styled-components'
import { theme } from '../../../../theme/tokens'
import { scrollReveal, sectionLead, sectionTitle, srOnly } from '../../landingType'

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
  ${scrollReveal}
  display: grid;
  gap: 16px;
  max-width: 62ch;
  margin-bottom: 32px;
`

export const Kicker = styled.p`
  ${srOnly}
`

export const Title = styled.h2`
  ${sectionTitle}
`

export const Lead = styled.p`
  ${sectionLead}
`

export const Stage = styled.div`
  display: grid;
  min-width: 0;

  @container landing (min-width: 900px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 420px);
    gap: 56px;
    align-items: center;
  }
`

/* One card on a phone: step tabs, the chosen line, then the still. On a wide landing the wrapper disappears so the cards sit beside the still. */
export const Frame = styled.div`
  display: grid;
  width: min(420px, 100%);
  justify-self: center;
  min-width: 0;
  border-radius: 28px;
  overflow: hidden;
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadow.lift};

  @container landing (min-width: 900px) {
    display: contents;
  }
`

export const Steps = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  min-width: 0;
  border-bottom: 1px solid ${theme.colors.border};

  @container landing (min-width: 900px) {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    border-bottom: 0;
  }
`

export const Step = styled.button<{ $on: boolean; $auto: boolean }>`
  position: relative;
  display: grid;
  gap: 4px;
  width: 100%;
  padding: 14px 6px 12px;
  text-align: center;
  font: inherit;
  color: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.muted)};
  cursor: pointer;
  border-radius: 0;
  border: 0;
  background: ${({ $on }) => ($on ? theme.colors.chipGreen : 'transparent')};
  box-shadow: none;
  overflow: hidden;

  strong {
    display: none;
    font-family: ${theme.fonts.display};
    font-weight: ${theme.fonts.displayWeight};
    font-size: 22px;
    color: ${theme.colors.forest};
  }

  @container landing (min-width: 900px) {
    padding: 16px 18px;
    text-align: start;
    color: ${theme.colors.ink};
    border-radius: ${theme.radii.lg};
    border: 1px solid ${({ $on }) => ($on ? theme.colors.forest : theme.colors.border)};
    background: ${({ $on }) => ($on ? theme.colors.creamCard : 'transparent')};
    box-shadow: ${({ $on }) => ($on ? theme.shadow.card : 'none')};

    strong {
      display: block;
    }
  }
  transition:
    background ${theme.motion.base} ${theme.motion.ease},
    border-color ${theme.motion.base} ${theme.motion.ease},
    box-shadow ${theme.motion.base} ${theme.motion.ease};

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
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  color: ${theme.colors.moss};
`

export const StepBody = styled.span`
  display: none;
  color: ${theme.colors.muted};
  font-size: 15px;
  line-height: 1.55;

  @container landing (min-width: 900px) {
    display: block;
  }
`

export const StepSummary = styled.div`
  display: grid;
  gap: 6px;
  padding: 14px 18px 0;

  strong {
    font-family: ${theme.fonts.display};
    font-weight: ${theme.fonts.displayWeight};
    font-size: 22px;
    color: ${theme.colors.forest};
  }

  span {
    color: ${theme.colors.muted};
    font-size: 15px;
    line-height: 1.55;
  }

  @container landing (min-width: 900px) {
    display: none;
  }
`

export const Shot = styled.div`
  position: relative;
  justify-self: center;
  width: 100%;
  aspect-ratio: 722 / 960;
  overflow: hidden;
  background: ${theme.colors.chipNeutral};

  @container landing (min-width: 900px) {
    width: min(420px, 100%);
    border-radius: 28px;
    border: 1px solid ${theme.colors.border};
    box-shadow: ${theme.shadow.lift};
  }

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;

    /* The stills start with an empty band. Tuck that under the step line on a phone. */
    @container landing (max-width: 899px) {
      top: -4%;
      height: 106%;
    }
    opacity: 0;
    transition: opacity ${theme.motion.slow} ${theme.motion.ease};
    user-select: none;
  }

  img[data-on='true'] {
    opacity: 1;
  }
`
