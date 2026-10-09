import { Link } from 'react-router-dom'
import styled, { css, keyframes } from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'
import type { CommunityGradeLetter } from '../../../../mock/types'

export type StackVariant = 'tab' | 'page' | 'widget'
export type Side = 'up' | 'right' | 'down' | 'left'

const cardRadius = '28px'

export const Frame = styled.div`
  display: grid;
  justify-items: center;
  gap: ${theme.space.md};
  padding-block: ${theme.space.sm} ${theme.space.xs};
`

export const Hint = styled.p`
  margin: 0;
  max-width: 440px;
  text-align: center;
  font-size: 13px;
  line-height: 1.45;
  color: ${theme.colors.muted};
`

export const Deck = styled.div<{ $variant: StackVariant }>`
  position: relative;
  width: ${({ $variant }) =>
    $variant === 'page' ? 'min(400px, 100%)' : $variant === 'widget' ? 'min(320px, 100%)' : 'min(340px, 100%)'};
  height: ${({ $variant }) =>
    $variant === 'page' ? 'clamp(400px, calc(100svh - 420px), 580px)' : $variant === 'widget' ? 'auto' : '460px'};
  aspect-ratio: ${({ $variant }) => ($variant === 'widget' ? '3 / 4' : 'auto')};
  margin-block-end: ${theme.space.sm};
  outline: none;
  border-radius: ${cardRadius};
  &:focus-visible {
    box-shadow: ${theme.shadow.focus};
  }
`

const cardBase = css`
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: ${cardRadius};
  background: ${theme.colors.forest};
  box-shadow: ${theme.shadow.soft};
`

export const Behind = styled.div`
  ${cardBase}
  transform: translateY(30px) scale(0.86);
  opacity: 0.5;
  background: ${theme.colors.forestSoft};
`

export const NextCard = styled.div`
  ${cardBase}
  z-index: 1;
  pointer-events: none;
  transform-origin: 50% 100%;
  transition: transform ${theme.motion.base} ${theme.motion.ease};
`

export const Card = styled.article<{ $animate: boolean; $leaving: boolean }>`
  ${cardBase}
  z-index: 2;
  box-shadow: ${theme.shadow.dialog};
  touch-action: none;
  user-select: none;
  cursor: grab;
  will-change: transform;
  transform-origin: 50% 85%;
  transition: ${({ $animate, $leaving }) =>
    !$animate
      ? 'none'
      : $leaving
        ? `transform 360ms ${theme.motion.exit}, opacity 360ms ${theme.motion.exit}`
        : `transform 480ms ${theme.motion.spring}`};
  &:active {
    cursor: grabbing;
  }
`

export const Photo = styled.div`
  position: absolute;
  inset: 0;
  background: ${theme.colors.forestSoft};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    pointer-events: none;
    -webkit-user-drag: none;
  }
  &::before {
    content: '';
    position: absolute;
    inset: 0 0 auto;
    z-index: 1;
    height: 22%;
    background: linear-gradient(to bottom, rgba(10, 30, 22, 0.45), transparent);
    pointer-events: none;
  }
  &::after {
    content: '';
    position: absolute;
    inset: auto 0 0;
    height: 58%;
    background: linear-gradient(to top, rgba(10, 30, 22, 0.92) 0%, rgba(10, 30, 22, 0.55) 45%, transparent 100%);
    pointer-events: none;
  }
`

export const Segments = styled.div`
  position: absolute;
  z-index: 3;
  inset: 10px 12px auto;
  display: flex;
  gap: ${theme.space.xs};
  pointer-events: none;
`

export const Segment = styled.span<{ $on: boolean }>`
  flex: 1;
  height: 4px;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.creamCard : 'color-mix(in srgb, var(--c-creamCard) 38%, transparent)')};
  transition: background ${theme.motion.base} ${theme.motion.ease};
`

const letterTone: Record<CommunityGradeLetter, string> = {
  S: theme.colors.growth,
  A: theme.colors.growth,
  B: theme.colors.warmth,
  C: theme.colors.danger,
}

export const Tint = styled.div<{ $letter: CommunityGradeLetter | null }>`
  position: absolute;
  inset: 0;
  z-index: 2;
  background: ${({ $letter }) => ($letter ? letterTone[$letter] : 'transparent')};
  mix-blend-mode: soft-light;
  pointer-events: none;
`

const stampTone: Record<CommunityGradeLetter, ReturnType<typeof css>> = {
  S: css`
    color: ${theme.colors.growth};
    border-color: ${theme.colors.growth};
    background: color-mix(in srgb, var(--c-forest) 55%, transparent);
  `,
  A: css`
    color: ${theme.colors.growth};
    border-color: ${theme.colors.growth};
    background: color-mix(in srgb, var(--c-forest) 40%, transparent);
  `,
  B: css`
    color: ${theme.colors.warmth};
    border-color: ${theme.colors.warmth};
    background: color-mix(in srgb, var(--c-ink) 40%, transparent);
  `,
  C: css`
    color: ${theme.colors.creamCard};
    border-color: ${theme.colors.danger};
    background: color-mix(in srgb, var(--c-danger) 55%, transparent);
  `,
}

/** Physical sides on purpose: swipe directions stay the same in RTL. The stamp sits opposite the throw, like a dating-app "like". */
const stampPlace: Record<Side, string> = {
  up: 'bottom: 34%; left: 50%; --tilt: 0deg; --shift: -50%;',
  right: 'top: 44px; left: 22px; --tilt: -14deg; --shift: 0;',
  down: 'top: 44px; left: 50%; --tilt: 0deg; --shift: -50%;',
  left: 'top: 44px; right: 22px; --tilt: 14deg; --shift: 0;',
}

export const Direction = styled.span<{ $side: Side; $letter: CommunityGradeLetter }>`
  position: absolute;
  z-index: 4;
  display: grid;
  place-items: center;
  min-width: 84px;
  height: 84px;
  padding: 0 ${theme.space.md};
  border: 4px solid;
  border-radius: 22px;
  font-family: ${theme.fonts.display};
  font-size: 54px;
  line-height: 1;
  letter-spacing: 0.02em;
  backdrop-filter: blur(4px);
  pointer-events: none;
  transform: translateX(var(--shift)) rotate(var(--tilt)) scale(var(--pop, 0.6));
  ${({ $letter }) => stampTone[$letter]}
  ${({ $side }) => stampPlace[$side]}
`

export const Overlay = styled.div`
  position: absolute;
  z-index: 3;
  inset: auto 0 0;
  display: flex;
  align-items: flex-end;
  gap: ${theme.space.md};
  padding: ${theme.space.lg} 20px 22px;
  color: ${theme.colors.creamCard};
`

export const Body = styled.div`
  flex: 1;
  display: grid;
  gap: 10px;
  min-width: 0;
`

export const Name = styled.h3<{ $variant?: StackVariant }>`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: ${({ $variant }) => ($variant === 'page' ? '32px' : '26px')};
  line-height: 1.05;
  color: ${theme.colors.creamCard};
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.25);
  overflow-wrap: break-word;
`

export const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: color-mix(in srgb, var(--c-creamCard) 92%, transparent);
`

export const MetaPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: ${theme.radii.pill};
  background: color-mix(in srgb, var(--c-creamCard) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--c-creamCard) 22%, transparent);
  backdrop-filter: blur(6px);
`

export const InfoLink = styled(Link)`
  ${pressable}
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.forest};
  box-shadow: ${theme.shadow.card};
  &:hover {
    background: ${theme.colors.growth};
    color: ${theme.colors.onGrowth};
  }
`

export const CountPill = styled.span`
  position: absolute;
  z-index: 3;
  top: 24px;
  inset-inline-end: 14px;
  padding: 4px 10px;
  border-radius: ${theme.radii.pill};
  background: rgba(10, 30, 22, 0.5);
  backdrop-filter: blur(6px);
  color: ${theme.colors.creamCard};
  font-size: 12px;
  font-weight: 700;
  pointer-events: none;
`

export const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
`

const pop = keyframes`
  0% { transform: scale(1); }
  40% { transform: scale(1.22); }
  100% { transform: scale(1); }
`

const actionTone: Record<CommunityGradeLetter, ReturnType<typeof css>> = {
  C: css`
    --tone: ${theme.colors.danger};
    --fill: ${theme.colors.danger};
    --ink: ${theme.colors.creamCard};
  `,
  B: css`
    --tone: ${theme.colors.warn};
    --fill: ${theme.colors.warmth};
    --ink: ${theme.colors.ink};
  `,
  S: css`
    --tone: ${theme.colors.forest};
    --fill: ${theme.colors.forest};
    --ink: ${theme.colors.growth};
  `,
  A: css`
    --tone: ${theme.colors.greenDark};
    --fill: ${theme.colors.growth};
    --ink: ${theme.colors.forest};
  `,
}

export const ActionButton = styled.button<{ $letter: CommunityGradeLetter; $big?: boolean; $pull: number; $fired: boolean }>`
  ${({ $letter }) => actionTone[$letter]}
  position: relative;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 1px;
  width: ${({ $big }) => ($big ? '66px' : '54px')};
  height: ${({ $big }) => ($big ? '66px' : '54px')};
  border: 2px solid ${({ $pull }) => ($pull > 0.02 ? 'var(--fill)' : theme.colors.border)};
  border-radius: ${theme.radii.pill};
  background: ${({ $pull }) => ($pull >= 1 ? 'var(--fill)' : theme.colors.creamCard)};
  color: ${({ $pull }) => ($pull >= 1 ? 'var(--ink)' : 'var(--tone)')};
  box-shadow: ${theme.shadow.card};
  font: inherit;
  cursor: pointer;
  transform: scale(${({ $pull }) => 1 + $pull * 0.16});
  transition:
    transform ${theme.motion.base} ${theme.motion.spring},
    background ${theme.motion.fast} ${theme.motion.ease},
    color ${theme.motion.fast} ${theme.motion.ease},
    border-color ${theme.motion.fast} ${theme.motion.ease};
  ${({ $fired }) =>
    $fired &&
    css`
      animation: ${pop} 360ms ${theme.motion.spring};
    `}
  strong {
    font-family: ${theme.fonts.display};
    font-weight: ${theme.fonts.displayWeight};
    font-size: ${({ $big }) => ($big ? '28px' : '23px')};
    line-height: 1;
  }
  small {
    font-size: 10px;
    line-height: 1;
    opacity: 0.7;
  }
  &:hover:not(:disabled) {
    transform: scale(1.08);
    border-color: var(--fill);
  }
  &:active:not(:disabled) {
    transform: scale(0.94);
  }
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`

export const UndoButton = styled.button`
  ${pressable}
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.warn};
  font-size: 18px;
  box-shadow: ${theme.shadow.soft};
  cursor: pointer;
  &:hover:not(:disabled) {
    background: ${theme.colors.chipWarm};
    transform: rotate(-30deg);
  }
  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`

export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`

export const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: ${theme.space.sm} 14px;
  min-height: 24px;
  font-size: 13px;
  color: ${theme.colors.muted};
`

export const TextLink = styled(Link)`
  font-weight: 600;
  color: ${theme.colors.forest};
  text-decoration: underline;
  text-underline-offset: 3px;
`

const floatIn = keyframes`
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: none; }
`

export const EmptyCard = styled.div`
  ${cardBase}
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 28px;
  text-align: center;
  border: 2px dashed ${theme.colors.border};
  box-shadow: none;
  background: ${theme.colors.cream};
  animation: ${floatIn} ${theme.motion.slow} ${theme.motion.ease} both;
  strong {
    font-family: ${theme.fonts.display};
    font-weight: ${theme.fonts.displayWeight};
    font-size: 28px;
    color: ${theme.colors.ink};
  }
  span {
    max-width: 280px;
    font-size: 14px;
    line-height: 1.5;
    color: ${theme.colors.muted};
  }
`
