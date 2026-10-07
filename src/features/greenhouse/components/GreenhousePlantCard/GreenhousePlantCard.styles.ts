import styled, { css, keyframes } from 'styled-components'
import { Link } from 'react-router-dom'
import { blurred } from '../../../../components/Skeleton/Skeleton'
import { riseIn, sproutIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

const freshGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(207, 234, 120, 0.95); transform: scale(0.94); }
  35% { box-shadow: 0 0 0 10px rgba(207, 234, 120, 0.55); transform: scale(1.02); }
  100% { box-shadow: 0 0 0 0 rgba(207, 234, 120, 0); transform: none; }
`

/** Same living halo as the add-photo plus, kept inside the shelf gap. */
const livingPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(207, 234, 120, 0.7); }
  50% { box-shadow: 0 0 0 7px rgba(207, 234, 120, 0); }
`

export const Root = styled.article<{
  $fresh?: boolean
  $care?: boolean
  $living?: boolean
  $skeleton?: boolean
  $blurred?: boolean
}>`
  /* A framed specimen: the photo sits inset in the card like a print in a mount. */
  display: grid;
  grid-template-rows: auto 1fr;
  padding: 6px;
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  background: ${theme.colors.creamCard};
  border: 1px solid ${({ $fresh }) => ($fresh ? theme.colors.moss : theme.colors.border)};
  transition:
    transform ${theme.motion.base} ${theme.motion.ease},
    box-shadow ${theme.motion.base} ${theme.motion.ease};
  ${({ $skeleton }) =>
    $skeleton &&
    css`
      pointer-events: none;
    `}
  ${({ $blurred }) => $blurred && blurred}
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
    transform: translateY(-4px);
    box-shadow: ${theme.shadow.lift};
  }

  &:hover img {
    transform: scale(1.06);
  }

  &:active {
    transform: translateY(-1px) scale(0.985);
    transition-duration: 80ms;
  }

  &:focus-within {
    border-color: ${theme.colors.moss};
  }

  @container (max-width: 559px) {
    align-self: start;
    width: 100%;
    padding: 4px;
    border-radius: ${theme.radii.lg};
    border-color: transparent;
    box-shadow: ${theme.shadow.soft};

    &:hover,
    &:hover img {
      transform: none;
    }

    &:hover {
      box-shadow: ${theme.shadow.soft};
    }
  }

  ${({ $living }) =>
    $living &&
    css`
      &&& {
        border: 2px dashed ${theme.colors.moss};
        animation:
          ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards,
          ${livingPulse} 2.4s ${theme.motion.ease} infinite;
      }

      &&&:hover,
      &&&:focus-within {
        border-style: solid;
        border-color: ${theme.colors.forest};
        animation: none;
        box-shadow: 0 0 0 5px ${theme.colors.chipGreen}, ${theme.shadow.lift};
      }

      &&&:active {
        transform: translateY(-1px) scale(0.985);
        border-style: solid;
        border-color: ${theme.colors.forest};
      }

      @media (prefers-reduced-motion: reduce) {
        &&& {
          animation: none;
        }
      }

      @container (max-width: 559px) {
        &&& {
          border: 2px dashed ${theme.colors.moss};
        }

        &&&:hover {
          transform: none;
          border-style: dashed;
          border-color: ${theme.colors.moss};
          animation:
            ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards,
            ${livingPulse} 2.4s ${theme.motion.ease} infinite;
          box-shadow: none;
        }

        &&&:active,
        &&&:focus-within {
          transform: scale(0.985);
          border-style: solid;
          border-color: ${theme.colors.forest};
          animation: none;
          box-shadow: 0 0 0 4px ${theme.colors.chipGreen};
        }
      }
    `}
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
  border-radius: ${theme.radii.md};
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
  padding: 4px 10px;
  border-radius: ${theme.radii.pill};
  backdrop-filter: blur(8px);
  background: ${({ $tone }) =>
    $tone === 'warm'
      ? theme.colors.warmth
      : $tone === 'fresh'
        ? theme.colors.growth
        : $tone === 'due'
          ? theme.colors.chipWarm
          : 'rgba(255, 254, 250, 0.92)'};
  color: ${theme.colors.forest};
  font-size: 11px;
  font-weight: 600;
  box-shadow: ${theme.shadow.soft};

  ${({ $tone }) =>
    $tone === 'calm' &&
    css`
      border: 1.5px dashed ${theme.colors.moss};
      transition:
        background ${theme.motion.fast} ${theme.motion.ease},
        border-color ${theme.motion.fast} ${theme.motion.ease},
        transform ${theme.motion.fast} ${theme.motion.ease};

      ${Root}:hover &,
      ${Root}:focus-within &,
      ${Root}:active & {
        background: ${theme.colors.growth};
        border-style: solid;
        border-color: ${theme.colors.forest};
        transform: translateY(-1px);
      }
    `}

  @container (max-width: 559px) {
    inset-block-start: 8px;
    inset-inline-start: 8px;
    max-width: calc(100% - 16px);
    padding: 3px 8px;
    font-size: 11px;
    line-height: 1.25;
    white-space: normal;

    ${({ $tone }) =>
      $tone === 'calm' &&
      css`
        ${Root}:hover & {
          background: rgba(255, 254, 250, 0.92);
          border-style: dashed;
          border-color: ${theme.colors.moss};
          transform: none;
        }

        ${Root}:active & {
          background: ${theme.colors.growth};
          border-style: solid;
          border-color: ${theme.colors.forest};
          transform: translateY(-1px);
        }
      `}
  }
`

export const Details = styled.div<{ $care?: boolean; $preview?: boolean }>`
  display: grid;
  gap: 8px;
  align-content: start;
  padding: 12px 8px 6px;

  @container (max-width: 559px) {
    ${({ $care, $preview }) =>
      $preview
        ? css`
            display: grid;
            gap: 8px;
            padding: 12px;
          `
        : $care
          ? css`
              display: grid;
              gap: 6px;
              padding: 8px 8px 10px;
            `
          : css`
              /* Phone shelf: the name only, so several plants can be told apart; tags stay off. */
              gap: 0;
              padding: 8px 6px 4px;

              > :not(:first-child) {
                display: none;
              }
            `}
  }
`

export const NameRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;

  /* Category photo stays pinned to the start; a long name wraps beside it, not onto its own row. */
  > :first-child {
    flex-shrink: 0;
    margin-top: 1px;
  }

  @container (max-width: 559px) {
    flex-wrap: nowrap;
    gap: 6px;
  }
`

/** A private plant (only its owner and admins see it): a small lock after the name. */
export const PrivateMark = styled.span`
  display: inline-grid;
  flex: none;
  place-items: center;
  width: 20px;
  height: 20px;
  margin-top: 2px;
  margin-inline-start: auto;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipNeutral};
  color: ${theme.colors.muted};
`

export const Name = styled(Link)`
  min-width: 0;
  overflow-wrap: anywhere;
  font-family: ${theme.fonts.display};
  font-size: 20px;
  font-weight: ${theme.fonts.displayWeight};
  line-height: 1.15;
  color: ${theme.colors.ink};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  @container (max-width: 559px) {
    min-width: 0;
    overflow: hidden;
    font-size: 14px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`

export const CareName = styled.span`
  min-width: 0;
  font-family: ${theme.fonts.display};
  font-size: 20px;
  font-weight: ${theme.fonts.displayWeight};
  line-height: 1.15;
  color: ${theme.colors.ink};
  overflow-wrap: anywhere;

  @container (max-width: 559px) {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    font-size: clamp(11px, 3.4cqw, 14px);
  }
`

export const CareActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;

  @container (max-width: 559px) {
    display: grid;
    gap: 4px;
  }
`

export const CareAction = styled.span<{ $tone: 'water' | 'photo' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 0 10px;
  border-radius: ${theme.radii.pill};
  background: ${({ $tone }) => ($tone === 'photo' ? theme.colors.metal : theme.colors.aiBlue)};
  color: ${theme.colors.creamCard};
  font-size: 12px;
  font-weight: 700;
  max-width: 100%;
  min-width: 0;

  span {
    color: ${theme.colors.creamCard};
  }

  @container (max-width: 559px) {
    justify-content: center;
    gap: 3px;
    min-height: 24px;
    padding: 3px 6px;
    font-size: clamp(9px, 3cqw, 11px);
    line-height: 1.15;
    text-align: center;
    overflow-wrap: anywhere;

    > :first-child {
      flex-shrink: 0;
    }
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
  font-size: 11px;
  font-weight: 600;
  box-shadow: ${theme.shadow.soft};

  @container (max-width: 559px) {
    inset-block: auto 8px;
    inset-inline: 8px auto;
    max-width: calc(100% - 16px);
    padding: 4px 8px;
    font-size: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

/** Identity chips on the bottom of the photo; they leave room for the photo count at the end. */
export const PhotoTags = styled.span<{ $count?: boolean }>`
  position: absolute;
  z-index: 1;
  inset-block-end: 10px;
  inset-inline-start: 10px;
  display: flex;
  max-width: ${({ $count }) => ($count ? 'calc(100% - 76px)' : 'calc(100% - 20px)')};
  min-width: 0;

  @container (max-width: 559px) {
    inset-block-end: 8px;
    inset-inline-start: 8px;
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

  @container (max-width: 559px) {
    inset-block-end: 8px;
    inset-inline-end: 8px;
    gap: 4px;
    padding: 4px 8px;
    font-size: 11px;
  }
`

export const CollectionGrid = styled.div`
  display: grid;
  gap: 12px;
  align-items: stretch;
  /* Room for the add tile on the start edge, including its hover scale. */
  padding-inline-start: 16px;
  padding-block: 8px 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @container (min-width: 560px) {
    gap: ${theme.space.md};
    grid-template-columns: repeat(auto-fill, minmax(min(160px, 100%), 1fr));
  }

  @container (min-width: 900px) {
    grid-template-columns: repeat(auto-fill, minmax(min(200px, 100%), 1fr));
  }

  /* Cards sprout from their bottom edge, one after another. */
  > * {
    animation: ${sproutIn} 560ms ${theme.motion.ease} backwards;
    transform-origin: 50% 100%;
    min-width: 0;
  }

  ${Array.from({ length: 10 }, (_, i) => `> :nth-child(${i + 2}) { animation-delay: ${(i + 1) * 55}ms; }`).join('\n')}
`
