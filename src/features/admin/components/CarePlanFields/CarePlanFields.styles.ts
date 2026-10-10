import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.fieldset`
  container-type: inline-size;
  display: grid;
  gap: 10px;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
`

export const Hint = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${theme.colors.muted};
`

/** One kind: name, mode select, then the custom numbers on their own line. */
export const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(120px, 0.6fr) minmax(0, 1fr);
  gap: 8px 12px;
  align-items: center;
  min-width: 0;

  @container (max-width: 420px) {
    grid-template-columns: minmax(0, 1fr);
  }
`

export const Kind = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.ink};
`

export const Numbers = styled.div`
  grid-column: 1 / -1;
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
