import styled from 'styled-components'
import type { CareIcon } from '../../../../mock/types'
import { careColor } from '../../careKinds'

export const Glyph = styled.span<{ $icon: CareIcon }>`
  display: inline-grid;
  place-items: center;
  color: ${({ $icon }) => careColor($icon)};
  line-height: 0;

  svg {
    display: block;
  }
`

export const Mark = styled.span<{ $icon: CareIcon }>`
  display: inline-grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: ${({ $icon }) => careColor($icon)};
  color: var(--c-creamCard);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--c-ink) 18%, transparent);

  ${Glyph} {
    color: var(--c-creamCard);
  }
`
