import styled, { css, keyframes } from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

const orbit = keyframes`
  0% { transform: rotate(0deg) translateX(40px) rotate(0deg) scale(0.6); opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { transform: rotate(300deg) translateX(40px) rotate(-300deg) scale(1); opacity: 0; }
`

const breathe = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(207, 234, 120, 0.6); }
  50% { box-shadow: 0 0 0 12px rgba(207, 234, 120, 0); }
`

export const Root = styled.button<{ $hero?: boolean }>`
  ${pressable}
  position: relative;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 10px;
  min-height: 280px;
  padding: 20px;
  border-radius: ${theme.radii.lg};
  border: 1px dashed ${theme.colors.border};
  background: transparent;
  color: ${theme.colors.forest};
  font: inherit;
  text-align: center;
  cursor: pointer;
  overflow: hidden;

  > strong {
    font-size: 14px;
    font-weight: 700;
  }

  &:hover {
    background: ${theme.colors.creamCard};
    border-color: ${theme.colors.moss};
    transform: translateY(-3px);
    box-shadow: ${theme.shadow.lift};
  }

  ${({ $hero }) =>
    !$hero &&
    css`
      @container (max-width: 559px) {
        min-height: 0;
        aspect-ratio: 1;
        gap: 0;
        padding: 8px;
        border-radius: ${theme.radii.md};

        > strong,
        > span:last-of-type {
          display: none;
        }
      }
    `}

  ${({ $hero }) =>
    $hero &&
    css`
      grid-column: 1 / -1;
      grid-template-columns: auto minmax(0, 1fr);
      justify-items: start;
      gap: 28px;
      min-height: 0;
      padding: 32px;
      border: 0;
      background:
        radial-gradient(circle at 12% 30%, rgba(207, 234, 120, 0.4), transparent 45%),
        linear-gradient(135deg, ${theme.colors.forest} 0%, ${theme.colors.forestSoft} 100%);
      color: ${theme.colors.creamCard};
      text-align: start;
      box-shadow: ${theme.shadow.card};

      &:hover {
        background:
          radial-gradient(circle at 12% 30%, rgba(207, 234, 120, 0.55), transparent 50%),
          linear-gradient(135deg, ${theme.colors.forest} 0%, ${theme.colors.forestSoft} 100%);
      }

      @container (max-width: 560px) {
        grid-template-columns: 1fr;
        justify-items: center;
        text-align: center;
        padding: 28px 20px;
      }
    `}
`

export const Orb = styled.span`
  position: relative;
  display: grid;
  place-items: center;
  width: 84px;
  height: 84px;

  @container (max-width: 559px) {
    width: 42px;
    height: 42px;
  }
`

export const Plus = styled.span`
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.growth};
  color: ${theme.colors.forest};
  font-size: 34px;
  font-weight: 400;
  line-height: 1;
  animation: ${breathe} 2.4s ${theme.motion.ease} infinite;

  @container (max-width: 559px) {
    width: 36px;
    height: 36px;
    font-size: 22px;
  }
`

export const Spark = styled.span`
  position: absolute;
  inset-block-start: calc(50% - 8px);
  inset-inline-start: calc(50% - 6px);
  color: ${theme.colors.moss};
  font-size: 14px;
  animation: ${orbit} 1.8s ${theme.motion.ease} infinite both;

  @media (prefers-reduced-motion: reduce) {
    display: none;
  }

  @container (max-width: 559px) {
    display: none;
  }
`

export const Hint = styled.span<{ $solid?: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.muted};

  ${({ $solid }) =>
    $solid &&
    css`
      display: inline-flex;
      align-items: center;
      min-height: 42px;
      padding: 0 20px;
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.growth};
      color: ${theme.colors.forest};
      font-size: 14px;
      font-weight: 800;
    `}
`

export const HeroBody = styled.span`
  display: grid;
  gap: 18px;
  justify-items: inherit;
  min-width: 0;
`

export const HeroCopy = styled.span`
  display: grid;
  gap: 8px;
  max-width: 520px;

  strong {
    font-family: ${theme.fonts.display};
    font-weight: 400;
    font-size: clamp(24px, 3vw, 32px);
    line-height: 1.15;
  }

  span {
    font-size: 14px;
    line-height: 1.55;
    opacity: 0.86;
  }
`
