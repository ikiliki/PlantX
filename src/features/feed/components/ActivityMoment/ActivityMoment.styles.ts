import styled, { css, keyframes } from 'styled-components'
import { backdropEnter, closeButton, dialogEnter, sheetBackdrop, sheetSurface } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'
import type { FeedUpdateKind } from '../../../../mock/types'

const INK: Record<FeedUpdateKind, string> = {
  water: '#2A628A',
  added: '#1B4A38',
  photo: '#9A6230',
  propagate: '#2F6B4A',
  grade: '#8A6416',
  listing: '#8A6416',
  scan: '#5B4A9B',
  passport: '#123C2D',
  edited: '#4A5A52',
  deleted: '#8A4A3A',
}

export function kindInk(kind: FeedUpdateKind) {
  return INK[kind]
}

const surface: Record<FeedUpdateKind, ReturnType<typeof css>> = {
  water: css`
    background:
      radial-gradient(90% 120% at 100% 80%, rgba(126, 190, 224, 0.55), transparent 58%),
      linear-gradient(165deg, #e5f3fb 0%, #fffefa 68%);
    border-color: #8ebcda;
  `,
  added: css`
    background:
      radial-gradient(80% 120% at 100% 100%, rgba(207, 234, 120, 0.75), transparent 60%),
      linear-gradient(165deg, #eef8d4 0%, #fffefa 70%);
    border-color: #8aaa62;
  `,
  photo: css`
    background:
      radial-gradient(80% 100% at 100% 0%, rgba(242, 200, 167, 0.85), transparent 55%),
      linear-gradient(165deg, #fff1e4 0%, #fffefa 70%);
    border-color: #e2b48a;
  `,
  propagate: css`
    background:
      radial-gradient(80% 110% at 100% 100%, rgba(143, 196, 154, 0.7), transparent 58%),
      linear-gradient(165deg, #e7f4e4 0%, #fffefa 72%);
    border-color: #7fa878;
  `,
  grade: css`
    background:
      radial-gradient(70% 100% at 100% 0%, rgba(244, 214, 120, 0.75), transparent 55%),
      linear-gradient(165deg, #fff6d8 0%, #fffefa 72%);
    border-color: #d4b46a;
  `,
  listing: css`
    background:
      radial-gradient(80% 100% at 100% 80%, rgba(242, 200, 167, 0.65), transparent 58%),
      linear-gradient(165deg, #fff3e2 0%, #fffefa 70%);
    border-color: #e4c29a;
  `,
  // AI scans have their own lavender: no other kind uses it (green is a new plant, blue is water).
  scan: css`
    background:
      radial-gradient(90% 120% at 100% 90%, rgba(178, 162, 232, 0.45), transparent 58%),
      linear-gradient(165deg, #f1edfb 0%, #fffefa 70%);
    border-color: #b9aee0;
  `,
  passport: css`
    background:
      radial-gradient(80% 100% at 100% 0%, rgba(36, 84, 63, 0.18), transparent 55%),
      linear-gradient(165deg, #e7f0e8 0%, #fffefa 72%);
    border-color: #24543f;
  `,
  // The owner's own bookkeeping: quiet neutrals, no celebration.
  edited: css`
    background: linear-gradient(165deg, #f1f2ee 0%, #fffefa 72%);
    border-color: #c9cec6;
  `,
  deleted: css`
    background: linear-gradient(165deg, #f6ece8 0%, #fffefa 72%);
    border-color: #dcbcb2;
  `,
}

export function momentSurface(kind: FeedUpdateKind) {
  return css`
    ${surface[kind]}
    color: ${INK[kind]};
  `
}

const ripple = keyframes`
  0% { transform: scale(0.35); opacity: 0.55; }
  100% { transform: scale(2.6); opacity: 0; }
`

const drip = keyframes`
  0%, 100% { translate: 0 0; }
  50% { translate: 0 7px; }
`

const sway = keyframes`
  0%, 100% { transform: rotate(-8deg) scale(1); }
  50% { transform: rotate(10deg) scale(1.08); }
`

const unfurl = keyframes`
  0%, 100% { transform: rotate(-18deg) scale(1); }
  50% { transform: rotate(22deg) scale(1.18); }
`

const flash = keyframes`
  0%, 62%, 100% { opacity: 0; }
  70% { opacity: 0.9; }
  82% { opacity: 0; }
`

const split = keyframes`
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(var(--shift)); }
`

const twinkle = keyframes`
  0%, 100% { opacity: 0.25; transform: scale(0.7) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(18deg); }
`

const bob = keyframes`
  0%, 100% { transform: translateY(0) rotate(-8deg); }
  50% { transform: translateY(-6px) rotate(6deg); }
`

const stamp = keyframes`
  0% { transform: rotate(-18deg) scale(1.4); opacity: 0; }
  60% { transform: rotate(6deg) scale(0.92); opacity: 1; }
  100% { transform: rotate(-8deg) scale(1); opacity: 1; }
`

const still = css`
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const Play = styled.span`
  position: absolute;
  z-index: 0;
  inset-block: 0;
  inset-inline-end: 0;
  width: 88px;
  pointer-events: none;
  overflow: hidden;
`

export const Ring = styled.span<{ $delay?: string }>`
  position: absolute;
  inset-inline-end: 8px;
  bottom: 10px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(42, 98, 138, 0.45);
  animation: ${ripple} 2.4s ease-out infinite;
  animation-delay: ${({ $delay }) => $delay ?? '0s'};
  ${still}
`

export const Drop = styled.span`
  position: absolute;
  inset-inline-end: 12px;
  top: 10px;
  width: 10px;
  height: 14px;
  border-radius: 50% 50% 50% 0;
  background: #3c6b8f;
  transform: rotate(-45deg);
  animation: ${drip} 1.6s ease-in-out infinite;
  ${still}
`

export const Sprout = styled.span`
  position: absolute;
  inset-inline-end: 2px;
  bottom: 6px;
  width: 30px;
  height: 34px;
  transform-origin: 50% 100%;
  animation: ${sway} 2.2s ease-in-out infinite;
  ${still}
`

export const Stem = styled.span`
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 3px;
  height: 22px;
  margin-left: -1px;
  border-radius: 99px;
  background: #2f6b4a;
`

export const Leaf = styled.span<{ $side?: 'right' }>`
  position: absolute;
  bottom: 14px;
  width: 14px;
  height: 9px;
  border-radius: 0 80% 0 80%;
  background: #6a9a48;
  transform-origin: ${({ $side }) => ($side === 'right' ? '0% 100%' : '100% 100%')};
  ${({ $side }) =>
    $side === 'right'
      ? css`
          left: 14px;
          transform: rotate(20deg);
        `
      : css`
          left: 4px;
          transform: rotate(-30deg) scaleX(-1);
        `}

  [data-moment='added']:hover & {
    animation: ${unfurl} 1.3s ease-in-out infinite;
    background: #cfea78;
  }

  ${still}
`

export const Flash = styled.span`
  position: absolute;
  inset-inline-end: 4px;
  top: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff 0%, rgba(242, 200, 167, 0.2) 70%);
  box-shadow: 0 0 0 3px rgba(154, 98, 48, 0.25);
  animation: ${flash} 2.8s ease-in-out infinite;
  ${still}
`

export const SplitLeaf = styled.span<{ $side?: 'right' }>`
  --shift: ${({ $side }) => ($side === 'right' ? '4px' : '-4px')};
  position: absolute;
  top: 14px;
  inset-inline-end: ${({ $side }) => ($side === 'right' ? '4px' : '16px')};
  width: 12px;
  height: 16px;
  border-radius: 80% 0 80% 0;
  background: #3f8f62;
  animation: ${split} 1.8s ease-in-out infinite;
  ${still}
`

export const Spark = styled.span<{ $i?: number }>`
  position: absolute;
  width: 8px;
  height: 8px;
  background: #e2b43a;
  clip-path: polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%);
  inset-inline-end: ${({ $i = 0 }) => 6 + $i * 8}px;
  top: ${({ $i = 0 }) => 10 + ($i === 1 ? 16 : 0)}px;
  animation: ${twinkle} 1.6s ease-in-out infinite;
  animation-delay: ${({ $i = 0 }) => `${$i * 0.25}s`};
  ${still}
`

export const PriceTag = styled.span`
  position: absolute;
  inset-inline-end: 6px;
  top: 12px;
  width: 20px;
  height: 16px;
  border-radius: 3px 8px 8px 3px;
  background: #f2c8a7;
  box-shadow: inset 6px 0 0 #fffefa;
  animation: ${bob} 1.8s ease-in-out infinite;
  ${still}

  &::after {
    content: '';
    position: absolute;
    top: 5px;
    inset-inline-start: 4px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #9a6230;
  }
`

export const Stamp = styled.span`
  position: absolute;
  inset-inline-end: 4px;
  top: 8px;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #24543f;
  color: #24543f;
  font-size: 14px;
  font-weight: 800;
  transform: rotate(-8deg);
  animation: ${stamp} 0.7s ${theme.motion.spring} both;
  ${still}
`

const glyph: Record<FeedUpdateKind, ReturnType<typeof css>> = {
  water: css`
    width: 8px;
    height: 11px;
    border-radius: 50% 50% 50% 0;
    background: #3c6b8f;
    transform: rotate(-45deg);
    animation: ${drip} 1.6s ease-in-out infinite;
  `,
  added: css`
    width: 10px;
    height: 12px;
    border-radius: 0 80% 0 80%;
    background: #5d7c4e;
    transform-origin: 50% 100%;
    animation: ${sway} 1.8s ease-in-out infinite;
    transition: background ${theme.motion.base} ${theme.motion.ease};

    [data-moment='added']:hover & {
      background: #2f6b4a;
    }
  `,
  photo: css`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #f2c8a7;
    box-shadow: inset 0 0 0 2px #9a6230;
    animation: ${flash} 2.8s ease-in-out infinite;
  `,
  propagate: css`
    width: 8px;
    height: 11px;
    border-radius: 80% 0;
    background: #3f8f62;
    box-shadow: 5px 2px 0 #8fc49a;
    animation: ${split} 1.8s ease-in-out infinite;
    --shift: 2px;
  `,
  grade: css`
    width: 10px;
    height: 10px;
    background: #e2b43a;
    clip-path: polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%);
    animation: ${twinkle} 1.6s ease-in-out infinite;
  `,
  listing: css`
    width: 12px;
    height: 9px;
    border-radius: 2px 6px 6px 2px;
    background: #f2c8a7;
    box-shadow: inset 4px 0 0 #fffefa;
    animation: ${bob} 1.8s ease-in-out infinite;
  `,
  // No glyph: the "AI scan" label and the lavender card say it.
  scan: css`
    display: none;
  `,
  passport: css`
    width: 12px;
    height: 12px;
    border: 1.5px solid #24543f;
    border-radius: 50%;
    animation: ${stamp} 0.7s ${theme.motion.spring} both;
  `,
  edited: css`
    width: 12px;
    height: 3px;
    border-radius: 2px;
    background: #4a5a52;
    transform: rotate(-35deg);
  `,
  deleted: css`
    width: 11px;
    height: 2px;
    border-radius: 2px;
    background: #8a4a3a;
    box-shadow: 0 0 0 0 transparent;
  `,
}

export const Glyph = styled.span<{ $kind: FeedUpdateKind }>`
  display: inline-block;
  flex: none;
  ${({ $kind }) => glyph[$kind]}
  ${still}
`

export const KindMark = styled.span<{ $kind: FeedUpdateKind }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  padding: 2px 8px;
  border-radius: ${theme.radii.pill};
  border: 1px solid ${theme.colors.border};
  font-size: 12px;
  font-weight: 700;
  line-height: 1.3;
  ${({ $kind }) => momentSurface($kind)}
`

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${theme.z.dialogTop};
  display: grid;
  place-items: center;
  padding: ${theme.space.md};
  background: ${theme.colors.overlay};
  ${backdropEnter}
  ${sheetBackdrop}
`

export const Dialog = styled.div<{ $kind: FeedUpdateKind }>`
  position: relative;
  width: min(440px, 100%);
  max-height: min(92vh, 760px);
  overflow: auto;
  padding: 22px 22px 20px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  container-type: inline-size;
  min-width: 0;
  ${({ $kind }) => momentSurface($kind)}
  ${dialogEnter}
  ${sheetSurface}

  @media (max-width: ${theme.breakpoints.sm}) {
    display: flex;
    flex-direction: column;
    height: 75svh;
    max-height: 75svh;
    overflow: hidden;
    padding-top: 28px;
  }
`

export const Close = styled.button`
  ${closeButton}
  position: absolute;
  z-index: 5;
  top: 12px;
  inset-inline-end: 12px;
`

export const Scroll = styled.div`
  position: relative;
  z-index: 1;
  min-width: 0;

  @media (max-width: ${theme.breakpoints.sm}) {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }
`

export const Copy = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  gap: 8px;
  min-width: 0;
  margin-inline-end: 36px;
`

export const Eyebrow = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const Note = styled.p`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-size: 26px;
  font-weight: 400;
  line-height: 1.2;
  color: ${theme.colors.forest};
  overflow-wrap: anywhere;
`

export const When = styled.time`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${theme.colors.muted};
`

export const PlantSlot = styled.div`
  position: relative;
  z-index: 1;
  width: min(300px, 100%);
  margin: 16px auto 0;
  container-type: inline-size;
`

export const Checks = styled.div`
  position: relative;
  z-index: 1;
  margin-top: 16px;
`
