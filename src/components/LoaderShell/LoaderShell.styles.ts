import styled, { keyframes } from 'styled-components'
import { theme } from '../../theme/tokens'

const rise = keyframes`
  from { opacity: 0.45; }
  to { opacity: 1; }
`

const sweep = keyframes`
  from { background-position: 100% 0; }
  to { background-position: -100% 0; }
`

export const Shell = styled.div<{ $fill?: boolean; $compact?: boolean }>`
  display: grid;
  justify-items: center;
  align-content: center;
  gap: ${({ $compact }) => ($compact ? '10px' : '16px')};
  min-height: ${({ $fill, $compact }) => ($fill ? '100svh' : $compact ? '140px' : '320px')};
  padding: ${({ $compact }) => ($compact ? '20px 12px' : '48px 16px 64px')};
`

export const Orb = styled.span<{ $compact?: boolean }>`
  width: ${({ $compact }) => ($compact ? '32px' : '46px')};
  height: ${({ $compact }) => ($compact ? '32px' : '46px')};
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 30%, #fff 0 3px, transparent 4px),
    radial-gradient(circle at 40% 35%, ${theme.colors.growth}, ${theme.colors.moss} 72%);
  box-shadow: inset 0 -8px 12px color-mix(in srgb, var(--c-forest) 22%, transparent);
  animation: ${rise} 900ms ${theme.motion.ease} infinite alternate;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

export const Label = styled.p`
  margin: 0;
  color: ${theme.colors.forest};
  font-size: 14px;
  font-weight: 700;
`

export const Rows = styled.div`
  display: grid;
  gap: 10px;
  width: min(720px, 100%);
`

export const Row = styled.span<{ $wide?: boolean }>`
  display: block;
  height: 44px;
  width: ${({ $wide }) => ($wide ? '100%' : '72%')};
  border-radius: ${theme.radii.md};
  background: linear-gradient(
    100deg,
    ${theme.colors.chipNeutral} 30%,
    ${theme.colors.creamCard} 50%,
    ${theme.colors.chipNeutral} 70%
  );
  background-size: 200% 100%;
  animation: ${sweep} 1.4s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background: ${theme.colors.chipNeutral};
  }
`
