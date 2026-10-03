import styled, { css } from 'styled-components'
import { popIn, riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

/** Sizes from its own width (`@container showcase`), so it fits the hero column on any screen. */
export const Stage = styled.div`
  container: showcase / inline-size;
  min-width: 0;
  user-select: none;
  animation: ${riseIn} 600ms ${theme.motion.ease} both;
`

/** A container does not query itself, so the layout lives one level in. */
export const Scene = styled.div`
  position: relative;
  min-width: 0;
  display: grid;
  gap: 12px;

  @container showcase (min-width: 520px) {
    display: block;
    padding-block: 40px 34px;
    padding-inline: 5%;
  }
`

const floating = css`
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  border-radius: 18px;
  box-shadow: ${theme.shadow.lift};
`

export const Card = styled.div`
  ${floating}
  border-radius: 26px;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;

  @container showcase (min-width: 520px) {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  }
`

export const Photo = styled.div`
  position: relative;
  min-width: 0;
  aspect-ratio: 4 / 3;
  background: ${theme.colors.chipGreen};

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @container showcase (min-width: 520px) {
    aspect-ratio: auto;
    min-height: 100%;
  }
`

export const Stamp = styled.span`
  position: absolute;
  inset-block-end: 12px;
  inset-inline-start: 12px;
  padding: 6px 10px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.growth};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
`

export const Body = styled.div`
  min-width: 0;
  padding: 18px 18px 20px;
  display: grid;
  gap: 4px;
  align-content: start;

  @container showcase (min-width: 520px) {
    padding: 22px 22px 24px;
  }
`

export const Eyebrow = styled.p`
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Name = styled.p`
  margin: 2px 0 0;
  font-family: ${theme.fonts.display};
  font-size: 28px;
  line-height: 1.1;
  color: ${theme.colors.forest};
`

export const Species = styled.p`
  margin: 0;
  font-size: 13px;
  font-style: italic;
  color: ${theme.colors.muted};
`

export const Facts = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 12px 0 6px;
`

export const Fact = styled.div`
  min-width: 0;
  padding: 8px 10px;
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.chipNeutral};

  span {
    display: block;
    font-size: 11px;
    color: ${theme.colors.muted};
  }

  strong {
    display: block;
    font-size: 13px;
    color: ${theme.colors.ink};
  }
`

export const TasksHead = styled.p`
  margin: 10px 0 2px;
  font-size: 12px;
  font-weight: 700;
  color: ${theme.colors.forest};
`

export const TaskList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
`

export const Task = styled.li<{ $done?: boolean }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: ${theme.radii.sm};
  border: 1px solid ${theme.colors.border};
  background: ${({ $done }) => ($done ? theme.colors.chipGreen : theme.colors.creamCard)};
`

export const TaskIcon = styled.span<{ $tone: 'water' | 'photo' }>`
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  color: ${({ $tone }) => ($tone === 'water' ? theme.colors.info : theme.colors.warn)};
  background: ${({ $tone }) => ($tone === 'water' ? '#E3EEF6' : theme.colors.chipWarm)};
`

export const TaskName = styled.span`
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.ink};
`

export const TaskWhen = styled.span`
  font-size: 12px;
  color: ${theme.colors.muted};
`

export const Check = styled.span`
  padding: 3px 8px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.cream};
  font-size: 11px;
  font-weight: 700;
`

export const History = styled.p`
  margin: 10px 0 0;
  padding-inline-start: 10px;
  border-inline-start: 2px solid ${theme.colors.growth};
  font-size: 12px;
  color: ${theme.colors.muted};
`

export const LevelChip = styled.div`
  ${floating}
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  min-width: 0;
  animation: ${popIn} 500ms 250ms ${theme.motion.ease} both;

  @container showcase (min-width: 520px) {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    width: min(270px, 48%);
  }
`

export const LevelText = styled.div`
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 4px;

  strong {
    font-size: 14px;
    color: ${theme.colors.forest};
  }

  span {
    font-size: 11px;
    color: ${theme.colors.muted};
  }
`

export const XpBar = styled.i`
  display: block;
  height: 6px;
  border-radius: ${theme.radii.pill};
  background: linear-gradient(
      to var(--xp-dir, right),
      ${theme.colors.moss} calc(var(--xp) * 100%),
      transparent 0
    ),
    ${theme.colors.track};

  [dir='rtl'] & {
    --xp-dir: left;
  }
`

export const XpGain = styled.span`
  padding: 4px 8px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.growth};
  color: ${theme.colors.forest};
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
`

export const Shelf = styled.div`
  ${floating}
  display: flex;
  align-items: center;
  gap: 10px;
  padding-block: 8px;
  padding-inline: 8px 14px;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.forest};
  animation: ${popIn} 500ms 400ms ${theme.motion.ease} both;

  @container showcase (min-width: 520px) {
    position: absolute;
    inset-block-end: 0;
    inset-inline-end: 0;
    width: max-content;
    max-width: 60%;
  }
`

export const ShelfThumbs = styled.span`
  display: flex;
  flex: none;

  img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid ${theme.colors.creamCard};
  }

  img + img {
    margin-inline-start: -10px;
  }
`
