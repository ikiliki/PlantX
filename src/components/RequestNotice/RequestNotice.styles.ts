import styled, { css, keyframes } from 'styled-components'
import { theme } from '../../theme/tokens'
import type { NoticeTone } from '../../lib/httpNotice'

const rise = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
`

export const Stack = styled.div`
  position: fixed;
  z-index: 90;
  bottom: max(16px, env(safe-area-inset-bottom));
  inset-inline-end: max(16px, env(safe-area-inset-right));
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
  width: min(320px, calc(100% - 32px));
  pointer-events: none;

  @media (max-width: ${theme.breakpoints.md}) {
    bottom: calc(${theme.layout.bottomNav} + env(safe-area-inset-bottom));
  }
`

export const Card = styled.article<{ $tone: NoticeTone }>`
  pointer-events: auto;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 12px 12px 12px 14px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.ink};
  box-shadow: ${theme.shadow.lift};
  animation: ${rise} ${theme.motion.base} ${theme.motion.ease};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const pulse = keyframes`
  from { transform: scale(1); }
  to { transform: scale(1.08); }
`

export const Orb = styled.span<{ $tone: NoticeTone }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 30%, #fff 0 2px, transparent 3px),
    radial-gradient(circle at 40% 35%, ${theme.colors.growth}, ${theme.colors.moss} 70%);
  box-shadow: inset 0 -6px 10px rgba(18, 60, 45, 0.25);

  ${({ $tone }) =>
    $tone === 'pending' &&
    css`
      animation: ${pulse} 900ms ${theme.motion.ease} infinite alternate;
      @media (prefers-reduced-motion: reduce) {
        animation: none;
      }
    `}

  ${({ $tone }) =>
    $tone === 'fail' &&
    css`
      background:
        radial-gradient(circle at 35% 30%, #fff 0 2px, transparent 3px),
        radial-gradient(circle at 40% 35%, ${theme.colors.warmth}, ${theme.colors.danger} 72%);
    `}
`

export const Copy = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
`

export const Title = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
`

export const Path = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.3;
  color: ${theme.colors.muted};
  overflow-wrap: anywhere;
`

export const Close = styled.button`
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: transparent;
  color: ${theme.colors.muted};
  font-size: 16px;
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.chipNeutral};
    color: ${theme.colors.forest};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
  }
`
