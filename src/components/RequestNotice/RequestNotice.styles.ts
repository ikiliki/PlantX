import styled, { keyframes } from 'styled-components'
import { theme } from '../../theme/tokens'

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
  width: min(380px, calc(100% - 32px));
  pointer-events: none;

  @media (max-width: ${theme.breakpoints.md}) {
    bottom: calc(${theme.layout.bottomNav} + env(safe-area-inset-bottom));
  }
`

export const Card = styled.article<{ $tone?: 'done' }>`
  pointer-events: auto;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: 10px 12px;
  padding: 12px 12px 12px 14px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background: ${({ $tone }) => ($tone === 'done' ? theme.colors.chipGreen : theme.colors.creamCard)};
  color: ${theme.colors.ink};
  box-shadow: ${theme.shadow.lift};
  animation: ${rise} ${theme.motion.base} ${theme.motion.ease};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const Orb = styled.span<{ $tone?: 'done' }>`
  width: 28px;
  height: 28px;
  margin-top: 2px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 30%, #fff 0 2px, transparent 3px),
    radial-gradient(circle at 40% 35%, ${theme.colors.warmth}, ${theme.colors.danger} 72%);
  box-shadow: inset 0 -6px 10px color-mix(in srgb, var(--c-forest) 25%, transparent);

  ${({ $tone }) =>
    $tone === 'done'
      ? `background: radial-gradient(circle at 35% 30%, #fff 0 2px, transparent 3px), radial-gradient(circle at 40% 35%, ${theme.colors.growth}, ${theme.colors.forest} 72%);`
      : ''}
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

export const Hint = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.35;
  color: ${theme.colors.muted};
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

export const Report = styled.button`
  grid-column: 2;
  justify-self: start;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${theme.colors.forest};
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;

  &:hover {
    color: ${theme.colors.moss};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${theme.shadow.focus};
    border-radius: ${theme.radii.sm};
  }
`

export const Form = styled.form`
  grid-column: 1 / -1;
  display: grid;
  gap: 8px;
`

export const Note = styled.textarea`
  width: 100%;
  min-height: 72px;
  resize: vertical;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  padding: 10px 12px;
  background: ${theme.colors.creamCard};
  color: ${theme.colors.ink};
  font: inherit;
  font-size: 14px;
  line-height: 1.4;

  &::placeholder {
    color: ${theme.colors.muted};
  }

  &:focus-visible {
    outline: none;
    border-color: ${theme.colors.forest};
    box-shadow: ${theme.shadow.focus};
  }
`

export const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

export const Count = styled.span`
  font-size: 12px;
  color: ${theme.colors.muted};
`

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const Failed = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.35;
  color: ${theme.colors.danger};
`
