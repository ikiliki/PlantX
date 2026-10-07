import styled, { css, keyframes } from 'styled-components'
import { theme } from '../../../../theme/tokens'

export type StickerTone = 'ok' | 'warn' | 'bad' | 'idle' | 'busy'

const stampIn = keyframes`
  0% { opacity: 0; transform: rotate(var(--tilt)) scale(1.6); }
  60% { opacity: 1; transform: rotate(var(--tilt)) scale(0.94); }
  100% { opacity: 1; transform: rotate(var(--tilt)) scale(1); }
`

const busyPulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
`

const tones: Record<StickerTone, ReturnType<typeof css>> = {
  ok: css`
    background: ${theme.colors.growth};
    color: ${theme.colors.forest};
  `,
  warn: css`
    background: ${theme.colors.chipWarm};
    color: ${theme.colors.warn};
  `,
  bad: css`
    background: #fbe3dc;
    color: ${theme.colors.danger};
  `,
  idle: css`
    background: rgba(255, 254, 250, 0.94);
    color: ${theme.colors.muted};
  `,
  busy: css`
    background: ${theme.colors.forest};
    color: ${theme.colors.growth};
    animation: ${busyPulse} 1.1s ease-in-out infinite;
  `,
}

/** A small "test passed" label stamped on a photo. */
export const Root = styled.span<{ $tone: StickerTone; $size: 'sm' | 'md' }>`
  --tilt: -4deg;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  min-width: 0;
  padding: ${({ $size }) => ($size === 'sm' ? '3px 7px' : '5px 10px')};
  border-radius: 6px;
  font-size: ${({ $size }) => ($size === 'sm' ? '9px' : '11px')};
  font-weight: 900;
  letter-spacing: ${({ $size }) => ($size === 'sm' ? '0.03em' : '0.06em')};
  line-height: 1.15;
  text-transform: ${theme.type.labelCase};
  white-space: ${({ $size }) => ($size === 'sm' ? 'normal' : 'nowrap')};
  box-shadow: 0 2px 8px rgba(18, 60, 45, 0.18);
  transform: rotate(var(--tilt));
  animation: ${stampIn} 420ms ${theme.motion.spring} both;
  ${({ $tone }) => tones[$tone]}

  &::after {
    content: '';
    position: absolute;
    inset: 2px;
    border: 1px dashed currentColor;
    border-radius: 4px;
    opacity: 0.45;
    pointer-events: none;
  }

  [dir='rtl'] & {
    --tilt: 4deg;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const Label = styled.span`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  overflow-wrap: break-word;
`

export const Pct = styled.span`
  opacity: 0.75;
`
