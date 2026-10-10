import styled, { css } from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'
import type { TodoSubcategory } from '../../../../mock/types'
import { careColor } from '../../careKinds'

const cardFace = css<{ $tone: TodoSubcategory }>`
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 12px;
  width: 100%;
  min-width: 0;
  padding: 10px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${({ $tone }) => careColor($tone)};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.lift};
  color: ${theme.colors.ink};
  text-align: start;
`

export const Card = styled.div<{ $tone: TodoSubcategory }>`
  ${cardFace}
`

/** Phone task: the whole card opens the day sheet. */
export const CardHit = styled.button<{ $tone: TodoSubcategory }>`
  ${cardFace}
  ${pressable}
  appearance: none;
  font: inherit;
  cursor: pointer;
`

export const Photo = styled.div`
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: ${theme.radii.md};
  overflow: hidden;
  background: ${theme.colors.cream};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const Tone = styled.span<{ $tone: TodoSubcategory }>`
  position: absolute;
  inset-inline: 4px;
  bottom: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 18px;
  padding: 0 6px;
  border-radius: ${theme.radii.pill};
  background: ${({ $tone }) => careColor($tone)};
  color: ${theme.colors.creamCard};
  font-size: 9px;
  font-weight: 800;
  letter-spacing: ${theme.type.labelTracking};
  text-transform: ${theme.type.labelCase};

  span {
    color: ${theme.colors.creamCard};
  }
`

export const Body = styled.div`
  display: grid;
  gap: 6px;
  align-content: start;
  min-width: 0;
`

export const DateField = styled.label`
  display: grid;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;

  input[type='date'] {
    min-height: 32px;
    padding: 0 8px;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.cream};
    font: inherit;
  }
`

/** First watering: the date and its Save / Cancel. */
export const DateForm = styled.form`
  display: grid;
  gap: 8px;
  min-width: 0;
`

export const DateActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

export const Name = styled.strong`
  font-size: 14px;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const Meta = styled.p`
  margin: 0;
  color: ${theme.colors.muted};
  font-size: 12px;
  line-height: 1.35;
`

export const Action = styled.button<{ $tone: TodoSubcategory | 'quiet' }>`
  ${pressable}
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-self: start;
  min-height: 32px;
  padding: 0 12px;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${({ $tone }) => ($tone === 'quiet' ? 'transparent' : careColor($tone))};
  color: ${({ $tone }) => ($tone === 'quiet' ? theme.colors.forest : theme.colors.creamCard)};
  box-shadow: ${({ $tone }) => ($tone === 'quiet' ? `inset 0 0 0 1px ${theme.colors.border}` : 'none')};
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  span {
    color: ${theme.colors.creamCard};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`
