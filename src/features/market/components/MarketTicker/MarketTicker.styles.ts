import { Link } from 'react-router-dom'
import styled, { css, keyframes } from 'styled-components'
import { theme } from '../../../../theme/tokens'
import { TICKER_VISIBLE_CAP } from '../../tickerTape'

const pan = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(min(0px, calc(100cqi - 100%))); }
`

const step = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(calc(var(--ticker-slot) * -1)); }
`

export const Tape = styled.div<{ $variant: 'bar' | 'glance' }>`
  container-type: inline-size;
  overflow: hidden;
  min-inline-size: 0;
  direction: ltr;

  ${({ $variant }) =>
    $variant === 'bar'
      ? css`
          background: ${theme.colors.creamCard};
          border: 1px solid ${theme.colors.border};
          border-radius: ${theme.radii.lg};
          box-shadow: ${theme.shadow.soft};
          margin-block-end: ${theme.space.lg};
        `
      : css`
          flex: 1 1 auto;
          background: transparent;
        `}
`

export const Track = styled.div<{ $motion: 'still' | 'pan' | 'step'; $fill: boolean; $min: string }>`
  --ticker-slot: max(${({ $min }) => $min}, calc(100cqi / ${TICKER_VISIBLE_CAP}));
  display: flex;
  align-items: stretch;
  inline-size: ${({ $fill }) => ($fill ? '100%' : 'max-content')};

  ${({ $motion }) =>
    $motion === 'step'
      ? css`
          animation: ${step} 2.4s linear infinite;
        `
      : $motion === 'pan'
        ? css`
            animation: ${pan} 32s linear infinite alternate;
          `
        : css`
            animation: none;
          `}

  &:hover {
    animation-play-state: paused;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const slotChrome = css`
  display: flex;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  padding-block: 10px;
  padding-inline: 18px;
  border-inline-end: 1px solid ${theme.colors.border};
  color: ${theme.colors.ink};
`

const slotSize = css<{ $variant: 'bar' | 'glance' }>`
  flex: 0 0 var(--ticker-slot);
  inline-size: var(--ticker-slot);
  max-inline-size: var(--ticker-slot);
  overflow: hidden;
`

export const Item = styled(Link)<{ $variant: 'bar' | 'glance' }>`
  ${slotChrome};
  ${slotSize};
  text-decoration: none;

  ${({ $variant }) =>
    $variant === 'glance' &&
    css`
      gap: 8px;
      padding-block: 8px;
      padding-inline: 14px;
    `}

  &:hover {
    background: rgba(93, 124, 78, 0.08);
  }
`

export const HeldItem = styled.div<{ $variant: 'bar' | 'glance' }>`
  ${slotChrome};
  ${slotSize};
  cursor: default;

  ${({ $variant }) =>
    $variant === 'glance' &&
    css`
      gap: 8px;
      padding-block: 8px;
      padding-inline: 14px;
    `}
`

export const EmptySlot = styled.div<{ $variant: 'bar' | 'glance' }>`
  ${slotChrome};
  flex: 1 1 0;
  min-inline-size: 0;
  max-inline-size: 240px;
  overflow: hidden;
  background: ${theme.colors.cream};

  ${({ $variant }) =>
    $variant === 'glance' &&
    css`
      gap: 8px;
      padding-block: 8px;
      padding-inline: 14px;
      max-inline-size: none;
    `}
`

export const Thumb = styled.div<{ $variant: 'bar' | 'glance'; $quiet?: boolean }>`
  inline-size: ${({ $variant }) => ($variant === 'bar' ? '36px' : '28px')};
  block-size: ${({ $variant }) => ($variant === 'bar' ? '36px' : '28px')};
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: ${({ $quiet }) => ($quiet ? theme.colors.track : theme.colors.chipGreen)};
  ${({ $quiet }) =>
    $quiet &&
    css`
      border: 1px dashed ${theme.colors.border};
    `}
`

export const Copy = styled.span`
  display: grid;
  gap: 2px;
  min-inline-size: 0;
  line-height: 1.15;
`

export const Code = styled.span<{ $variant: 'bar' | 'glance' }>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${({ $variant }) => ($variant === 'bar' ? '11px' : '10px')};
  font-weight: 800;
  letter-spacing: 0.06em;
  color: ${theme.colors.greenDark};
`

export const Quiet = styled.span<{ $variant: 'bar' | 'glance' }>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${({ $variant }) => ($variant === 'bar' ? '11px' : '10px')};
  font-weight: 700;
  letter-spacing: 0.08em;
  color: ${theme.colors.muted};
`

export const Price = styled.span<{ $variant: 'bar' | 'glance'; $dir: 'up' | 'down' | 'flat' }>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${({ $variant }) => ($variant === 'bar' ? '13px' : '12px')};
  font-weight: 700;
  color: ${({ $dir }) =>
    $dir === 'down' ? theme.colors.danger : $dir === 'up' ? theme.colors.greenDark : theme.colors.muted};
`
