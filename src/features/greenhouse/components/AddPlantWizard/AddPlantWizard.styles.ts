import styled, { css, keyframes } from 'styled-components'
import { popIn, riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

const slideIn = (from: number) => keyframes`
  from { opacity: 0; transform: translateX(${from}px); }
  to { opacity: 1; transform: none; }
`

const checkPop = keyframes`
  0% { transform: scale(0); }
  60% { transform: scale(1.18); }
  100% { transform: scale(1); }
`

const leafFly = keyframes`
  0% { opacity: 0; transform: rotate(calc(var(--i) * 36deg)) translateY(0) scale(0.4); }
  25% { opacity: 1; }
  100% { opacity: 0; transform: rotate(calc(var(--i) * 36deg)) translateY(-86px) scale(1); }
`

const halo = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(207, 234, 120, 0.9); }
  100% { box-shadow: 0 0 0 26px rgba(207, 234, 120, 0); }
`

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  min-width: 0;
  min-height: 0;
  container-type: inline-size;
`

export const Scroll = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  /* The step slides in sideways; hide that overflow so no horizontal scrollbar flashes. */
  overflow-x: hidden;
  overflow-y: auto;
`

export const StepBody = styled.div<{ $direction: 1 | -1 }>`
  display: grid;
  gap: 12px;
  min-width: 0;
  animation: ${({ $direction }) => slideIn($direction * 28)} ${theme.motion.slow} ${theme.motion.ease} both;

  [dir='rtl'] & {
    animation-name: ${({ $direction }) => slideIn($direction * -28)};
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

/** Phone width: the stepper already names the step, so the heading and lead give the room to the form. */
export const StepHead = styled.header`
  display: grid;
  gap: 6px;

  @container (max-width: 419px) {
    display: none;
  }
`

export const StepTitle = styled.h3`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: 400;
  font-size: clamp(22px, 4cqi, 28px);
  line-height: 1.15;
  color: ${theme.colors.forest};
`

export const StepLead = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${theme.colors.muted};
  overflow-wrap: anywhere;
`

export const PhotoNote = styled.p`
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${theme.colors.muted};
  overflow-wrap: anywhere;
`

export const Section = styled.div`
  display: grid;
  gap: 12px;
  min-width: 0;
  animation: ${riseIn} ${theme.motion.base} ${theme.motion.ease} both;
`

export const Banner = styled.div<{ $tone: 'ai' | 'warn' | 'manual' }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  padding: 12px 14px;
  border-radius: ${theme.radii.md};
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  animation: ${riseIn} ${theme.motion.base} ${theme.motion.ease} both;

  /* Phone width: info banners drop; a warning keeps its restore action. */
  ${({ $tone }) =>
    $tone !== 'warn' &&
    css`
      @container (max-width: 419px) {
        display: none;
      }
    `}

  ${({ $tone }) =>
    $tone === 'ai'
      ? css`
          background: ${theme.colors.forest};
          color: ${theme.colors.creamCard};
          span::before {
            content: '✦ ';
            color: ${theme.colors.growth};
          }
        `
      : $tone === 'warn'
        ? css`
            background: ${theme.colors.chipWarm};
            color: ${theme.colors.warn};
          `
        : css`
            background: ${theme.colors.chipNeutral};
            color: ${theme.colors.warn};
            box-shadow: inset 0 0 0 1px ${theme.colors.border};
            span::before {
              content: '! ';
            }
          `}
`

export const BannerAction = styled.button`
  min-height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.growth};
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
`

/** Review: one button per empty required field, each opening its step. */
export const MissingActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

/** Short note next to a field label that still needs a value. */
export const MissingField = styled.span`
  font-size: 12px;
  font-weight: 800;
  color: ${theme.colors.warn};
`

export const More = styled.details`
  display: grid;
  gap: 16px;
  padding: 12px 14px;
  border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};

  summary {
    font-size: 13px;
    font-weight: 800;
    color: ${theme.colors.forest};
    cursor: pointer;
  }

  &[open] summary {
    margin-bottom: 14px;
  }

  > fieldset + fieldset {
    margin-top: 16px;
  }
`

export const ClassCode = styled.p`
  justify-self: start;
  margin: 0;
  padding: 6px 12px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipGreen};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: ${theme.colors.forest};
  font-variant-numeric: tabular-nums;
`

export const PhotoActions = styled.div`
  display: flex;
  flex-direction: row;
  direction: ltr;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  margin-inline-start: auto;
`

export const Review = styled.article`
  display: grid;
  gap: ${theme.space.md};
  padding: 14px;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadow.card};
  animation: ${popIn} ${theme.motion.slow} ${theme.motion.ease} both;

  @container (min-width: 540px) {
    grid-template-columns: 200px minmax(0, 1fr);
    align-items: start;

    > :first-child {
      width: 100%;
    }
  }
`

export const ReviewPhoto = styled.div<{ $drop?: boolean }>`
  position: relative;
  /* Stacked, a full-width square pushes the fields below the fold. */
  width: min(100%, 240px);
  justify-self: center;
  border-radius: ${theme.radii.md};
  overflow: hidden;
  /* With a photo it is a square tile; holding the drop it hugs the drop (no empty green zone). */
  ${({ $drop }) =>
    $drop
      ? css`
          background: transparent;
        `
      : css`
          aspect-ratio: 1;
          background: ${theme.colors.chipGreen};
        `}

  > img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const CategoryMark = styled.span`
  position: absolute;
  z-index: 1;
  width: 44px;
  height: 44px;
  inset-inline-end: 8px;
  bottom: 8px;
  border-radius: ${theme.radii.sm};
  overflow: hidden;
  border: 2px solid ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.card};
  background: ${theme.colors.chipGreen};

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

/** The AI badge stamped on the review photo, like the passport gallery's stamp. */
export const PhotoBadge = styled.div`
  position: absolute;
  z-index: 1;
  top: 10px;
  inset-inline-start: 10px;
  max-width: calc(100% - 20px);
  filter: drop-shadow(0 6px 14px rgba(12, 32, 24, 0.28));
`

export const AiAnswer = styled.div`
  display: grid;
  gap: 4px;
  width: 100%;
  padding: 10px 12px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipGreen};
  color: ${theme.colors.forest};

  strong {
    font-size: 13px;
  }
`

export const AiFact = styled.p`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;

  span {
    font-weight: 600;
    color: ${theme.colors.moss};
  }
`

export const ReviewBody = styled.div`
  display: grid;
  gap: 10px;
  justify-items: start;
  min-width: 0;
`

export const ReviewName = styled.h4`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: 400;
  font-size: 22px;
  line-height: 1.2;
  color: ${theme.colors.ink};
`

export const ReviewRows = styled.dl`
  display: grid;
  width: 100%;
  margin: 0;
`

export const ReviewRow = styled.div`
  display: grid;
  grid-template-columns: minmax(90px, 36%) minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid ${theme.colors.border};

  dt {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${theme.colors.moss};
  }

  dd {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: ${theme.colors.ink};
    overflow-wrap: anywhere;
  }

  &[data-missing='true'] {
    margin-inline: -8px;
    padding-inline: 8px;
    border-radius: ${theme.radii.sm};
    background: ${theme.colors.chipWarm};
  }

  &[data-missing='true'] dt,
  &[data-missing='true'] dd {
    color: ${theme.colors.warn};
  }
`

export const EditLink = styled.button`
  padding: 4px 8px;
  border: 0;
  border-radius: ${theme.radii.sm};
  background: none;
  color: ${theme.colors.moss};
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.chipGreen};
    color: ${theme.colors.forest};
  }
`

export const Footer = styled.div<{ $static?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 12px;

  ${({ $static }) =>
    !$static &&
    css`
      position: sticky;
      bottom: calc(-1 * ${theme.space.lg});
      z-index: 2;
      margin: 0 calc(-1 * ${theme.space.lg}) calc(-1 * ${theme.space.lg});
      padding: 14px ${theme.space.lg} calc(14px + env(safe-area-inset-bottom));
      background: linear-gradient(180deg, rgba(244, 241, 232, 0.6) 0%, ${theme.colors.cream} 30%);
      backdrop-filter: blur(6px);
      border-top: 1px solid ${theme.colors.border};
    `}
`

export const FooterHint = styled.span<{ $tone?: 'muted' | 'bad' }>`
  flex: 1 1 160px;
  font-size: 12px;
  font-weight: ${({ $tone }) => ($tone === 'bad' ? 700 : 400)};
  line-height: 1.35;
  color: ${({ $tone }) => ($tone === 'bad' ? theme.colors.danger : theme.colors.muted)};
  text-align: center;
`

export const Done = styled.div`
  display: grid;
  justify-items: center;
  gap: 14px;
  padding: 24px 0 8px;
  text-align: center;
`

export const Burst = styled.div`
  position: relative;
  display: grid;
  place-items: center;
  width: 120px;
  height: 120px;
  margin-bottom: 6px;
`

export const Check = styled.span`
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 84px;
  height: 84px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.growth};
  font-size: 40px;
  font-weight: 800;
  animation:
    ${checkPop} 520ms ${theme.motion.spring} both,
    ${halo} 1.1s ${theme.motion.ease} 300ms 2;
`

export const Leaf = styled.span`
  position: absolute;
  inset-block-start: calc(50% - 7px);
  inset-inline-start: calc(50% - 5px);
  width: 10px;
  height: 14px;
  border-radius: 10px 0;
  background: ${theme.colors.moss};
  transform-origin: 50% 50%;
  animation: ${leafFly} 1s ${theme.motion.ease} calc(120ms + var(--i) * 18ms) both;

  &:nth-child(odd) {
    background: ${theme.colors.growth};
  }

  @media (prefers-reduced-motion: reduce) {
    display: none;
  }
`

export const DoneTitle = styled.h3`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: 400;
  font-size: 30px;
  color: ${theme.colors.forest};
`
