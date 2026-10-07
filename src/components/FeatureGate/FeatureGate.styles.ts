import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Frame = styled.div`
  position: relative;
  isolation: isolate;
  min-width: 0;
  width: 100%;
  overflow: hidden;
  border-radius: inherit;
`

export const Live = styled.div`
  min-width: 0;
  filter: blur(2.5px);
  opacity: 0.7;
  pointer-events: none;
  user-select: none;
`

export const Scrim = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(244, 241, 232, 0.22) 0%,
    rgba(244, 241, 232, 0.08) 40%,
    rgba(244, 241, 232, 0.18) 100%
  );
  pointer-events: none;
`

export const Banner = styled.div`
  position: absolute;
  z-index: 2;
  top: 12px;
  inset-inline: 12px;
  display: flex;
  justify-content: center;
  pointer-events: none;
`

export const Card = styled.div`
  display: grid;
  gap: 2px;
  justify-items: start;
  width: max-content;
  max-width: min(240px, 100%);
  padding: 8px 10px;
  border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.border};
  background: rgba(255, 254, 250, 0.96);
  box-shadow: ${theme.shadow.soft};
`

export const Mark = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 2px 8px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipNeutral};
  border: 1px solid ${theme.colors.border};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};
  color: ${theme.colors.moss};
`

export const Title = styled.p`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: 15px;
  line-height: 1.2;
  color: ${theme.colors.forest};
`

export const Body = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.35;
  color: ${theme.colors.muted};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

/** Compact notice used only when there is no feature UI to preview. */
export const Notice = styled.div`
  display: grid;
  justify-items: start;
  gap: 10px;
  width: 100%;
  min-width: 0;
  padding: 20px;
  border-radius: ${theme.radii.lg};
  border: 1px dashed ${theme.colors.border};
  background: ${theme.colors.creamCard};
`
