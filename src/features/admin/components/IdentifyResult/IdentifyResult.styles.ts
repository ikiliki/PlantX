import styled from 'styled-components'
import { Field } from '../../../../components/Form/Form.styles'
import { theme } from '../../../../theme/tokens'

export const Root = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  min-width: 0;
`

export const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
`

export const Answer = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;

  strong {
    font-family: ${theme.fonts.display};
    font-size: 22px;
    font-weight: 400;
    line-height: 1.2;
    color: ${theme.colors.forest};
  }

  em {
    font-size: 13px;
    color: ${theme.colors.muted};
  }
`

export const Problem = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${theme.colors.danger};
`

export const Subhead = styled(Field).attrs({ as: 'h3' })`
  margin: 0;
`

export const Block = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;
`

export const TriedList = styled.ul`
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 8px;
    font-size: 13px;
    color: ${theme.colors.ink};
  }

  small {
    color: ${theme.colors.muted};
    font-size: 12px;
    overflow-wrap: anywhere;
  }
`

export const Raw = styled.details`
  min-width: 0;
  border-top: 1px solid ${theme.colors.border};
  padding-top: 10px;

  summary {
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    color: ${theme.colors.forest};
  }

  pre {
    margin: 8px 0 0;
    padding: 12px;
    max-height: 320px;
    overflow: auto;
    border-radius: ${theme.radii.sm};
    background: ${theme.colors.chipNeutral};
    color: ${theme.colors.ink};
    font-size: 12px;
    line-height: 1.45;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    direction: ltr;
    text-align: left;
  }
`
