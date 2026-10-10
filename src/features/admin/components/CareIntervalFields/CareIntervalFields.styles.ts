import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;
`

export const Toggle = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${theme.colors.ink};
  cursor: pointer;
`

export const Numbers = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 8px 12px;
  padding-inline-start: 24px;

  label {
    display: grid;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    color: ${theme.colors.muted};
  }

  input[type='number'] {
    width: min(110px, 100%);
  }
`

export const Check = styled.label`
  && {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 40px;
  }
`
