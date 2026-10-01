import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'
import { menuIn, pressable, riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Root = styled.article`
  display: grid;
  grid-template-rows: auto 1fr;
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  transition:
    transform ${theme.motion.base} ${theme.motion.ease},
    box-shadow ${theme.motion.base} ${theme.motion.ease};

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

export const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

export const PrimaryAction = styled.button`
  ${pressable}
  appearance: none;
  min-height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.creamCard};
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`

export const MoreWrap = styled.div`
  position: relative;
`

export const MenuButton = styled.button`
  ${pressable}
  appearance: none;
  width: 34px;
  height: 34px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.forest};
  font: inherit;
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
`

export const Menu = styled.div`
  position: absolute;
  z-index: ${theme.z.menu};
  inset-block-end: calc(100% + 6px);
  inset-inline-end: 0;
  min-width: 148px;
  padding: 6px;
  border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.card};
  animation: ${menuIn} ${theme.motion.fast} ${theme.motion.ease} both;
`

export const MenuItem = styled.button`
  appearance: none;
  display: block;
  width: 100%;
  margin: 0;
  padding: 10px 12px;
  border: 0;
  border-radius: ${theme.radii.sm};
  background: transparent;
  color: ${theme.colors.ink};
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  text-align: start;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.chipGreen};
  }
`

export const AddRoot = styled.button`
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 10px;
  min-height: 280px;
  border-radius: ${theme.radii.lg};
  border: 1px dashed ${theme.colors.border};
  background: transparent;
  color: ${theme.colors.forest};
  cursor: pointer;

  span {
    font-size: 14px;
    font-weight: 700;
  }

  &:hover {
    background: ${theme.colors.creamCard};
  }
`

export const Plus = styled.span`
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipNeutral};
  font-size: 32px;
  font-weight: 400;
  line-height: 1;
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
