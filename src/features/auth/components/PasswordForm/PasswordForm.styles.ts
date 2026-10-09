import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

const onForest = (alpha: number) => `color-mix(in srgb, var(--c-cream) calc(${alpha} * 100%), transparent)`

export const Form = styled.form`
  display: grid;
  gap: 10px;
  width: 100%;
  min-width: 0;
`

export const Field = styled.label`
  display: grid;
  gap: 4px;
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
  color: ${onForest(0.8)};
`

export const Input = styled.input`
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid ${onForest(0.22)};
  border-radius: ${theme.radii.md};
  background: ${onForest(0.08)};
  color: ${theme.colors.cream};
  font: inherit;
  font-size: 15px;
  &::placeholder {
    color: ${onForest(0.45)};
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 1px;
  }
`

export const Hint = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: ${onForest(0.6)};
`

/** "or" between the password form and the Google button. */
export const Divider = styled.p`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  margin: 2px 0;
  font-size: 12px;
  color: ${onForest(0.6)};
  &::before,
  &::after {
    content: '';
    border-top: 1px solid ${onForest(0.2)};
  }
`
