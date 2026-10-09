import styled from 'styled-components'
import type { TodoSubcategory } from '../../../../mock/types'
import { theme } from '../../../../theme/tokens'

const water = theme.colors.water
const metal = theme.colors.metal

export const Glyph = styled.span<{ $kind: TodoSubcategory }>`
  display: inline-grid;
  place-items: center;
  color: ${({ $kind }) => ($kind === 'photo' ? metal : water)};
  line-height: 0;

  svg {
    display: block;
  }
`

export const Mark = styled.span<{ $kind: TodoSubcategory }>`
  display: inline-grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: ${({ $kind }) => ($kind === 'photo' ? metal : water)};
  color: var(--c-creamCard);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--c-ink) 18%, transparent);

  ${Glyph} {
    color: var(--c-creamCard);
  }
`
