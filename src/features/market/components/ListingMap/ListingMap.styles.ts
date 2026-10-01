import { Link } from 'react-router-dom'
import styled, { css, keyframes } from 'styled-components'
import { theme } from '../../../../theme/tokens'

const fade = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
`

export const Frame = styled.div<{ $tall?: boolean }>`
  position: relative;
  height: ${({ $tall }) => ($tall ? '100%' : '420px')};
  min-height: ${({ $tall }) => ($tall ? '360px' : '0')};
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.chipNeutral};

  @media (max-width: 700px) {
    height: ${({ $tall }) => ($tall ? '320px' : '360px')};
    min-height: 0;
  }
`

export const MapCanvas = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  direction: ltr;
  background: ${theme.colors.track};

  &.leaflet-container {
    font-family: ${theme.fonts.body};
    background: ${theme.colors.track};
  }

  .leaflet-bar {
    border: 1px solid ${theme.colors.border} !important;
    border-radius: 12px !important;
    overflow: hidden;
    box-shadow: ${theme.shadow.soft};
  }

  .leaflet-bar a {
    width: 32px;
    height: 32px;
    line-height: 32px;
    background: ${theme.colors.creamCard};
    color: ${theme.colors.forest};
    border-bottom-color: ${theme.colors.border} !important;
  }

  .leaflet-bar a:hover,
  .leaflet-bar a:focus {
    background: ${theme.colors.cream};
    color: ${theme.colors.forest};
  }

  .leaflet-control-attribution {
    background: rgba(255, 254, 250, 0.9);
    color: ${theme.colors.muted};
    font-size: 10px;
    line-height: 1.3;
    max-width: 72%;
  }

  .leaflet-control-attribution a {
    color: ${theme.colors.forestMid};
  }

  .leaflet-marker-icon.px-pin {
    background: transparent;
    border: none;
  }

  .px-pin {
    --pin-bg: ${theme.colors.creamCard};
    --pin-fg: ${theme.colors.forest};
    --pin-border: ${theme.colors.border};
  }

  .px-pin.is-on {
    --pin-bg: ${theme.colors.forest};
    --pin-fg: ${theme.colors.cream};
    --pin-border: ${theme.colors.forest};
  }

  .px-pin-label {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: max-content;
    max-width: 120px;
    height: 28px;
    padding: 0 8px;
    border-radius: ${theme.radii.pill};
    border: 1px solid var(--pin-border);
    background: var(--pin-bg);
    color: var(--pin-fg);
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
    box-shadow: ${theme.shadow.soft};
    cursor: pointer;
  }

  .px-pin.is-on .px-pin-label {
    transform: translateX(-50%) scale(1.06);
  }

  .px-pin.is-masked .px-pin-label {
    color: transparent;
    text-shadow: 0 0 7px var(--pin-fg);
    user-select: none;
  }

  .px-pin-label::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -4px;
    width: 7px;
    height: 7px;
    background: var(--pin-bg);
    border-right: 1px solid var(--pin-border);
    border-bottom: 1px solid var(--pin-border);
    transform: translateX(-50%) rotate(45deg);
  }
`

const peekBox = css<{ $rtl?: boolean }>`
  position: absolute;
  top: 12px;
  left: 52px;
  right: 12px;
  z-index: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 58px;
  padding: 7px 10px;
  border-radius: ${theme.radii.md};
  background: rgba(255, 254, 250, 0.96);
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadow.soft};
  color: ${theme.colors.ink};
  text-decoration: none;
  direction: ${({ $rtl }) => ($rtl ? 'rtl' : 'ltr')};
  animation: ${fade} 0.2s ease;
`

export const Peek = styled(Link)<{ $rtl?: boolean }>`
  ${peekBox}
`

export const PeekButton = styled.button<{ $rtl?: boolean }>`
  ${peekBox};
  font: inherit;
  text-align: start;
  cursor: pointer;
`

export const PeekPhoto = styled.div`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  background: ${theme.colors.chipGreen};
`

export const PeekCopy = styled.div`
  min-width: 0;
  display: grid;
  gap: 2px;
  strong {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  span {
    font-size: 12px;
    color: ${theme.colors.muted};
  }
`

export const PeekDock = styled.div<{ $rtl?: boolean }>`
  ${peekBox};
  display: block;
  padding: 0;
  background: transparent;
  border: 0;
  box-shadow: none;
  width: min(280px, calc(100% - 64px));
`
