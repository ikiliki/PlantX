import styled from 'styled-components'
import { pressable, riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Root = styled.div`
  display: grid;
  gap: 20px;
  min-width: 0;
  container-type: inline-size;
`

export const Head = styled.header`
  display: grid;
  gap: 6px;
  animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} both;
`

export const Title = styled.h2`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: clamp(28px, 6cqi, 40px);
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: ${theme.colors.forest};
`

export const Lead = styled.p`
  margin: 0;
  max-width: 52ch;
  font-size: ${theme.text.base};
  color: ${theme.colors.muted};
`

/** "24 growers · 180 plants", with a small lime dot. */
export const Stats = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-family: ${theme.fonts.display};
  font-size: ${theme.text.base};
  font-weight: 600;
  color: ${theme.colors.forest};

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${theme.colors.growth};
    box-shadow: 0 0 0 4px ${theme.colors.chipGreen};
  }
`

export const Controls = styled.div`
  display: grid;
  gap: 10px;
  min-width: 0;

  @container (min-width: 760px) {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }
`

export const SearchField = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: ${theme.control.md};
  padding: 0 16px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
  color: ${theme.colors.muted};

  &:focus-within {
    box-shadow: ${theme.shadow.focus};
  }
`

export const Search = styled.input`
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  background: transparent;
  color: ${theme.colors.ink};
  font: inherit;
  font-size: ${theme.text.md};

  &::placeholder {
    color: ${theme.colors.muted};
  }

  &:focus,
  &:focus-visible {
    outline: none;
    box-shadow: none;
  }
`

/** Sort pebbles in one row; on a narrow phone the row scrolls sideways. */
export const Sort = styled.div`
  display: flex;
  gap: 6px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`

export const SortOption = styled.button<{ $on: boolean }>`
  ${pressable}
  flex: none;
  min-height: ${theme.control.sm};
  padding: 0 14px;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.creamCard)};
  color: ${({ $on }) => ($on ? theme.colors.cream : theme.colors.forest)};
  box-shadow: ${({ $on }) => ($on ? 'none' : theme.shadow.soft)};
  font-family: ${theme.fonts.display};
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background: ${({ $on }) => ($on ? theme.colors.forestMid : theme.colors.chipGreen)};
  }
`

export const NearChip = styled(SortOption)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${({ $on }) => ($on ? theme.colors.growth : theme.colors.creamCard)};
  color: ${({ $on }) => ($on ? theme.colors.onGrowth : theme.colors.forest)};

  &:hover {
    background: ${({ $on }) => ($on ? theme.colors.growth : theme.colors.chipGreen)};
  }
`

export const SectionTitle = styled.h3`
  margin: 0 0 12px;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: ${theme.text.lg};
  color: ${theme.colors.forest};
`

/** Greenhouse cards: one column on a phone, then as many as fit. */
export const Grid = styled.div`
  display: grid;
  gap: 16px;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr);

  @container (min-width: 560px) {
    grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  }

  > * {
    animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards;
  }

  ${Array.from({ length: 10 }, (_, i) => `> :nth-child(${i + 2}) { animation-delay: ${(i + 1) * 45}ms; }`).join('\n')}
`
