import styled, { css, keyframes } from 'styled-components'
import { fadeIn, popIn, riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'
import type { AiScanState } from './AiScan'

const sweep = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(260%); }
`

const pulse = keyframes`
  0%, 100% { transform: translate(-50%, -50%) scale(0.6); opacity: 0.35; }
  50% { transform: translate(-50%, -50%) scale(1.25); opacity: 1; }
`

const breathe = keyframes`
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
`

const shimmer = keyframes`
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
`

const blink = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const twinkle = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
  50% { transform: scale(0.7) rotate(45deg); opacity: 0.6; }
`

const lockIn = keyframes`
  from { transform: scale(1.35); opacity: 0; }
  to { transform: none; opacity: 1; }
`

const stampIn = keyframes`
  0% { opacity: 0; transform: translateX(-50%) scale(1.6) rotate(-8deg); }
  60% { opacity: 1; transform: translateX(-50%) scale(0.94) rotate(-3deg); }
  100% { opacity: 1; transform: translateX(-50%) scale(1) rotate(-3deg); }
`

const skeletonLine = css`
  background: linear-gradient(
    90deg,
    ${theme.colors.chipGreen} 0%,
    ${theme.colors.creamCard} 50%,
    ${theme.colors.chipGreen} 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s linear infinite;
`

export const Root = styled.div`
  container-type: inline-size;
  min-width: 0;
  animation: ${fadeIn} ${theme.motion.base} ${theme.motion.ease} both;
`

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${theme.space.lg};

  @container (min-width: 560px) {
    grid-template-columns: minmax(200px, 240px) minmax(0, 1fr);
    align-items: start;
  }
`

export const PhotoWell = styled.div`
  position: relative;
  justify-self: center;
  width: min(280px, 100%);
`

export const Close = styled.button`
  position: absolute;
  z-index: 3;
  inset-block-start: 8px;
  inset-inline-end: 8px;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.creamCard};
  font: inherit;
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  box-shadow: ${theme.shadow.soft};
`

export const Frame = styled.div<{ $state: AiScanState }>`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  background: ${theme.colors.forest};
  box-shadow: ${theme.shadow.card};

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition:
      filter ${theme.motion.slow} ${theme.motion.ease},
      transform 1.2s ${theme.motion.ease};
    ${({ $state }) =>
      $state === 'scanning'
        ? css`
            filter: saturate(0.7) brightness(0.82);
            transform: scale(1.06);
          `
        : $state === 'unverified'
          ? css`
              filter: grayscale(0.4);
            `
          : null}
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(color-mix(in srgb, var(--c-growth) 50%, transparent) 1px, transparent 1px);
    background-size: 16px 16px;
    opacity: ${({ $state }) => ($state === 'scanning' ? 0.6 : 0)};
    transition: opacity ${theme.motion.slow} ${theme.motion.ease};
    animation: ${breathe} 1.8s ease-in-out infinite;
  }
`

export const Scanline = styled.span`
  position: absolute;
  inset-inline: 0;
  inset-block-start: 0;
  z-index: 1;
  height: 40%;
  background: linear-gradient(
    180deg,
    transparent 0%,
    color-mix(in srgb, var(--c-growth) 28%, transparent) 85%,
    color-mix(in srgb, var(--c-growth) 95%, transparent) 100%
  );
  border-bottom: 2px solid ${theme.colors.growth};
  filter: drop-shadow(0 4px 10px color-mix(in srgb, var(--c-growth) 90%, transparent));
  animation: ${sweep} 2.1s cubic-bezier(0.45, 0, 0.55, 1) infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    inset-block-start: 45%;
  }
`

export const Node = styled.span`
  position: absolute;
  z-index: 2;
  width: 12px;
  height: 12px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.growth};
  box-shadow:
    0 0 0 4px color-mix(in srgb, var(--c-growth) 25%, transparent),
    0 0 18px color-mix(in srgb, var(--c-growth) 90%, transparent);
  animation: ${pulse} 1.3s ease-in-out infinite both;
`

const cornerAt = {
  ss: css`
    inset-block-start: 12px;
    inset-inline-start: 12px;
    border-block-start-width: 3px;
    border-inline-start-width: 3px;
  `,
  se: css`
    inset-block-start: 12px;
    inset-inline-end: 12px;
    border-block-start-width: 3px;
    border-inline-end-width: 3px;
  `,
  es: css`
    inset-block-end: 12px;
    inset-inline-start: 12px;
    border-block-end-width: 3px;
    border-inline-start-width: 3px;
  `,
  ee: css`
    inset-block-end: 12px;
    inset-inline-end: 12px;
    border-block-end-width: 3px;
    border-inline-end-width: 3px;
  `,
}

export const Corner = styled.span<{ $at: keyof typeof cornerAt; $state: AiScanState }>`
  position: absolute;
  z-index: 2;
  width: 26px;
  height: 26px;
  border: 0 solid
    ${({ $state }) =>
      $state === 'unverified' ? theme.colors.warmth : $state === 'answered' ? theme.colors.growth : 'color-mix(in srgb, var(--c-creamCard) 85%, transparent)'};
  border-radius: 6px;
  ${({ $at }) => cornerAt[$at]}
  ${({ $state }) =>
    $state === 'scanning'
      ? css`
          animation: ${breathe} 1.1s ease-in-out infinite;
        `
      : css`
          animation: ${lockIn} ${theme.motion.slow} ${theme.motion.spring} both;
        `}
`

export const Stamp = styled.span<{ $tone: 'ok' | 'warn' }>`
  position: absolute;
  z-index: 3;
  inset-block-end: 18px;
  left: 50%;
  padding: 8px 14px;
  border-radius: ${theme.radii.pill};
  white-space: nowrap;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  box-shadow: ${theme.shadow.lift};
  background: ${({ $tone }) => ($tone === 'ok' ? theme.colors.growth : theme.colors.chipWarm)};
  color: ${({ $tone }) => ($tone === 'ok' ? theme.colors.onGrowth : theme.colors.warn)};
  animation: ${stampIn} 520ms ${theme.motion.spring} both;
`

export const Panel = styled.div`
  display: grid;
  gap: 14px;
  align-content: start;
  min-width: 0;
`

export const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

export const Title = styled.h3<{ $sparkle?: boolean }>`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: 22px;
  line-height: 1.2;
  color: ${theme.colors.forest};

  ${({ $sparkle }) =>
    $sparkle &&
    css`
      &::before {
        content: '✦';
        display: inline-block;
        margin-inline-end: 8px;
        color: ${theme.colors.moss};
        animation: ${twinkle} 1.2s ease-in-out infinite;
      }
    `}
`

export const StageList = styled.ol`
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
`

export const Stage = styled.li<{ $state: 'done' | 'current' | 'next' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ $state }) => ($state === 'next' ? theme.colors.muted : theme.colors.ink)};
  opacity: ${({ $state }) => ($state === 'next' ? 0.55 : 1)};
  transition: opacity ${theme.motion.base} ${theme.motion.ease};

  &::before {
    content: '${({ $state }) => ($state === 'done' ? '✓' : '')}';
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border-radius: ${theme.radii.pill};
    font-size: 11px;
    font-weight: 800;
    ${({ $state }) =>
      $state === 'done'
        ? css`
            background: ${theme.colors.forest};
            color: ${theme.colors.growth};
            animation: ${popIn} ${theme.motion.base} ${theme.motion.spring} both;
          `
        : $state === 'current'
          ? css`
              border: 2px solid ${theme.colors.chipGreen};
              border-top-color: ${theme.colors.forest};
              animation: ${spin} 0.8s linear infinite;
            `
          : css`
              border: 2px solid ${theme.colors.border};
            `}
  }
`

export const Shimmer = styled.div`
  height: 4px;
  border-radius: ${theme.radii.pill};
  ${skeletonLine}
  background: linear-gradient(90deg, ${theme.colors.chipGreen} 0%, ${theme.colors.growth} 50%, ${theme.colors.chipGreen} 100%);
  background-size: 200% 100%;
`

export const Facts = styled.dl`
  display: grid;
  gap: 10px;
  margin: 0;
`

export const Skeleton = styled.div`
  height: 34px;
  border-radius: ${theme.radii.sm};
  ${skeletonLine}
`

export const Fact = styled.div`
  display: grid;
  grid-template-columns: minmax(96px, 34%) minmax(0, 1fr);
  align-items: baseline;
  gap: 12px;
  padding: 8px 12px;
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  animation: ${riseIn} ${theme.motion.base} ${theme.motion.ease} both;

  @container (max-width: 360px) {
    grid-template-columns: 1fr;
    gap: 2px;
  }
`

export const FactLabel = styled.dt`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  color: ${theme.colors.moss};
`

export const FactValue = styled.dd`
  margin: 0;
  min-height: 1.3em;
  font-size: 15px;
  font-weight: 700;
  color: ${theme.colors.ink};
  overflow-wrap: anywhere;
`

export const Caret = styled.span`
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-inline-start: 2px;
  vertical-align: text-bottom;
  background: ${theme.colors.moss};
  animation: ${blink} 0.8s steps(1) infinite;
`

export const Ring = styled.div`
  --size: 58px;
  position: relative;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: var(--size);
  height: var(--size);
  border-radius: ${theme.radii.pill};
  background: conic-gradient(${theme.colors.forest} calc(var(--pct) * 1%), ${theme.colors.track} 0);

  &::before {
    content: '';
    position: absolute;
    inset: 5px;
    border-radius: inherit;
    background: ${theme.colors.cream};
  }
`

export const RingValue = styled.span`
  position: relative;
  font-size: 14px;
  font-weight: 800;
  color: ${theme.colors.forest};
  font-variant-numeric: tabular-nums;
`

export const Notice = styled.div`
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipWarm};
  border: 1px solid color-mix(in srgb, var(--c-warn) 22%, transparent);
  animation: ${riseIn} ${theme.motion.base} ${theme.motion.ease} both;

  ${Title} {
    font-size: 19px;
    color: ${theme.colors.warn};
  }
`

export const Body = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${theme.colors.ink};
`

export const Attribution = styled.div<{ $in: boolean }>`
  display: grid;
  gap: 8px;
  opacity: ${({ $in }) => ($in ? 1 : 0)};
  transform: ${({ $in }) => ($in ? 'none' : 'translateY(6px)')};
  transition:
    opacity ${theme.motion.slow} ${theme.motion.ease},
    transform ${theme.motion.slow} ${theme.motion.ease};

  strong {
    font-size: 13px;
    color: ${theme.colors.forest};
  }
`

export const Chain = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

export const ChainItem = styled.span<{ $tone: 'ok' | 'skip' | 'idle'; $pulse?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: ${theme.radii.pill};
  font-size: 12px;
  font-weight: 700;
  ${({ $tone }) =>
    $tone === 'ok'
      ? css`
          background: ${theme.colors.forest};
          color: ${theme.colors.growth};
        `
      : $tone === 'skip'
        ? css`
            background: ${theme.colors.chipNeutral};
            color: ${theme.colors.muted};
            text-decoration: line-through;
            text-decoration-thickness: 1px;
          `
        : css`
            background: ${theme.colors.creamCard};
            color: ${theme.colors.muted};
            box-shadow: inset 0 0 0 1px ${theme.colors.border};
          `}
  ${({ $pulse }) =>
    $pulse &&
    css`
      animation: ${breathe} 1.2s ease-in-out infinite;
    `}

  small {
    font-size: 10px;
    font-weight: 700;
    text-decoration: none;
    opacity: 0.85;
  }
`

export const DemoNote = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${theme.colors.muted};
`