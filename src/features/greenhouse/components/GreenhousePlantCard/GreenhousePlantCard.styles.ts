import styled, { css, keyframes } from 'styled-components'
import { Link } from 'react-router-dom'
import { riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

const freshGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(207, 234, 120, 0.95); transform: scale(0.94); }
  35% { box-shadow: 0 0 0 10px rgba(207, 234, 120, 0.55); transform: scale(1.02); }
  100% { box-shadow: 0 0 0 0 rgba(207, 234, 120, 0); transform: none; }
`

export const Root = styled.article<{ $fresh?: boolean }>`
  display: grid;
  grid-template-rows: auto 1fr;
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  background: ${theme.colors.creamCard};
  border: 1px solid ${({ $fresh }) => ($fresh ? theme.colors.moss : theme.colors.border)};
  transition:
    transform ${theme.motion.base} ${theme.motion.ease},
    box-shadow ${theme.motion.base} ${theme.motion.ease};
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
`

export const Details = styled.div`
  display: grid;
  gap: 10px;
  align-content: start;
  padding: 14px 16px 16px;
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
  gap: ${theme.space.md};
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

  > * {
    animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards;
  }

  ${Array.from({ length: 8 }, (_, i) => `> :nth-child(${i + 2}) { animation-delay: ${(i + 1) * 45}ms; }`).join('\n')}
`
