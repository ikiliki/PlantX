import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Root = styled.div`
  container-type: inline-size;
  width: 100%;
  min-width: 0;
`

export const Veil = styled.div`
  position: relative;
  min-width: 0;
  overflow: hidden;
`

export const DataBlur = styled.div`
  filter: blur(5px);
  pointer-events: none;
  user-select: none;
`

export const SoonBanner = styled.div`
  position: absolute;
  inset: 0;
  z-index: 3;
  overflow: hidden;
  pointer-events: none;

  span {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 160%;
    margin: 0;
    padding: 8px 0;
    transform: translate(-50%, -50%) rotate(-12deg);
    background: rgba(255, 254, 250, 0.94);
    border-block: 1px solid ${theme.colors.border};
    box-shadow: ${theme.shadow.soft};
    color: ${theme.colors.forest};
    font-family: ${theme.fonts.display};
    font-size: clamp(20px, 3vw, 28px);
    font-weight: 400;
    line-height: 1.1;
    text-align: center;
    white-space: nowrap;
  }
`

export const Widget = styled.section`
  position: relative;
  display: grid;
  gap: 10px;
  min-width: 0;
  padding: 14px 14px 16px;
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadow.soft};
`

/** "Coming soon" above the blurred preview of the market. */
export const SoonPill = styled.p`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  padding: 8px 14px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipWarm};
  color: ${theme.colors.warn};
  font-size: 13px;
  font-weight: 800;

  span {
    color: ${theme.colors.growth};
    filter: drop-shadow(0 0 1px ${theme.colors.forest});
  }
`
