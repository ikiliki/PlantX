import styled, { css, keyframes } from 'styled-components'
import { Link } from 'react-router-dom'
import { riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

const freshGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(207, 234, 120, 0.95); transform: scale(0.94); }
  35% { box-shadow: 0 0 0 10px rgba(207, 234, 120, 0.55); transform: scale(1.02); }
  100% { box-shadow: 0 0 0 0 rgba(207, 234, 120, 0); transform: none; }
`

export const Root = styled.article<{ $fresh?: boolean; $care?: boolean }>`
  display: grid;
  grid-template-rows: auto 1fr;
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  background: ${theme.colors.creamCard};
  border: 1px solid ${({ $fresh }) => ($fresh ? theme.colors.moss : theme.colors.border)};
  transition:
    transform ${theme.motion.base} ${theme.motion.ease},
    box-shadow ${theme.motion.base} ${theme.motion.ease};
  ${({ $care }) =>
    $care &&
    css`
      cursor: pointer;

      &:focus-visible {
        outline: 2px solid ${theme.colors.growth};
        outline-offset: 2px;
      }
    `}
  ${({ $fresh }) =>
    $fresh &&
    css`
      animation: ${freshGlow} 1.4s ${theme.motion.ease} 2 both !important;
    `}

  img {
    transition:
      transform ${theme.motion.slow} ${theme.motion.ease},
      opacity ${theme.motion.slow} ${theme.motion.ease};
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${theme.shadow.lift};
  }

  &:hover img {
    transform: scale(1.04);
  }

  @container (max-width: 559px) {
    border-radius: ${theme.radii.md};
  }
`

export const PhotoLink = styled(Link)`
  display: block;
  color: inherit;
  text-decoration: none;
`

export const Photo = styled.div<{ $stale?: boolean }>`
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: ${theme.colors.chipGreen};

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    ${({ $stale }) =>
      $stale &&
      css`
        filter: grayscale(0.35);
        opacity: 0.82;
      `}
  }
`

export const StatusMark = styled.span<{ $tone?: 'warm' | 'fresh' | 'calm' | 'due' }>`
  position: absolute;
  z-index: 1;
  inset-block-start: 10px;
  inset-inline-start: 10px;
  max-width: calc(100% - 20px);
  padding: 5px 10px;
  border-radius: ${theme.radii.pill};
  background: ${({ $tone }) =>
    $tone === 'warm'
      ? theme.colors.warmth
      : $tone === 'fresh'
        ? theme.colors.growth
        : $tone === 'due'
          ? theme.colors.chipWarm
          : 'rgba(255, 254, 250, 0.92)'};
  color: ${theme.colors.forest};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  box-shadow: ${theme.shadow.soft};

  @container (max-width: 559px) {
    inset-block-start: 4px;
    inset-inline-start: 4px;
    max-width: calc(100% - 8px);
    padding: 2px 5px;
    font-size: 8px;
    letter-spacing: 0.03em;
  }
`

export const Details = styled.div<{ $care?: boolean }>`
  display: grid;
  gap: 10px;
  align-content: start;
  padding: 14px 16px 16px;

  @container (max-width: 559px) {
    ${({ $care }) =>
      $care
        ? css`
            display: grid;
            gap: 6px;
            padding: 8px 8px 10px;
          `
        : css`
            display: none;
          `}
  }
`

export const NameRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`

export const Name = styled(Link)`
  font-family: ${theme.fonts.display};
  font-size: 20px;
  font-weight: 400;
  line-height: 1.15;
  color: ${theme.colors.ink};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  @container (max-width: 559px) {
    font-size: 14px;
  }
`

export const CareName = styled.span`
  font-family: ${theme.fonts.display};
  font-size: 20px;
  font-weight: 400;
  line-height: 1.15;
  color: ${theme.colors.ink};

  @container (max-width: 559px) {
    font-size: 14px;
  }
`

export const CareActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
`

export const CareAction = styled.span<{ $tone: 'water' | 'photo' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 0 10px;
  border-radius: ${theme.radii.pill};
  background: ${({ $tone }) => ($tone === 'photo' ? '#8B929A' : '#3B7CC9')};
  color: ${theme.colors.creamCard};
  font-size: 12px;
  font-weight: 700;

  span {
    color: ${theme.colors.creamCard};
  }
`

export const PassportMark = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipGreen};
  color: ${theme.colors.forest};
  font-size: 11px;
  font-weight: 700;
`

export const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
`

export const CareDate = styled.span`
  position: absolute;
  z-index: 1;
  inset-block-start: 10px;
  inset-inline-end: 10px;
  padding: 5px 10px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.creamCard};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  box-shadow: ${theme.shadow.soft};

  @container (max-width: 559px) {
    inset-block-start: 4px;
    inset-inline-end: 4px;
    padding: 2px 5px;
    font-size: 8px;
  }
`

export const PhotoCount = styled.span`
  position: absolute;
  z-index: 1;
  inset-block-end: 10px;
  inset-inline-end: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: ${theme.radii.pill};
  background: rgba(18, 60, 45, 0.78);
  color: ${theme.colors.creamCard};
  font-size: 11px;
  font-weight: 800;
  backdrop-filter: blur(6px);
`

export const CollectionGrid = styled.div`
  display: grid;
  gap: ${theme.space.sm};
  grid-template-columns: repeat(4, minmax(0, 1fr));

  @container (min-width: 560px) {
    gap: ${theme.space.md};
    grid-template-columns: repeat(auto-fill, minmax(min(160px, 100%), 1fr));
  }

  @container (min-width: 900px) {
    grid-template-columns: repeat(auto-fill, minmax(min(200px, 100%), 1fr));
  }

  > * {
    animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards;
    min-width: 0;
  }

  ${Array.from({ length: 8 }, (_, i) => `> :nth-child(${i + 2}) { animation-delay: ${(i + 1) * 45}ms; }`).join('\n')}
`
