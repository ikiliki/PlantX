import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

const water = '#3B7CC9'
const metal = '#8B929A'

export const Root = styled.div`
  display: grid;
  gap: 20px;
  min-width: 0;
`

export const Block = styled.section`
  display: grid;
  gap: 10px;
  min-width: 0;

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 800;
    color: ${theme.colors.ink};
  }
`

export const List = styled.ul`
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
`

export const Row = styled.li<{ $tone: 'water' | 'photo'; $mark?: boolean; $done?: boolean }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  min-width: 0;
  padding: 10px 12px;
  border-radius: ${theme.radii.md};
  border: 1px solid
    ${({ $tone, $mark }) => {
      if ($mark) return $tone === 'photo' ? metal : water
      return theme.colors.border
    }};
  background: ${({ $tone, $done }) => {
    if ($done) return theme.colors.cream
    if ($tone === 'photo') return 'linear-gradient(90deg, #ECEEF0 0%, #F7F7F8 100%)'
    return 'linear-gradient(90deg, #E8F1FB 0%, #F7FAFD 100%)'
  }};
  box-shadow: ${({ $mark }) => ($mark ? theme.shadow.soft : 'none')};
  opacity: ${({ $done }) => ($done ? 0.88 : 1)};
  color: inherit;
  text-decoration: none;

  &:is(a):hover {
    box-shadow: ${theme.shadow.soft};
  }
`

/** Chevron on a planned row that opens the task. */
export const Go = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.moss};

  [dir='rtl'] & {
    transform: scaleX(-1);
  }
`

export const Kind = styled.span`
  display: grid;
  place-items: center;
  line-height: 0;
`

export const Copy = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;

  strong {
    font-size: 14px;
    font-weight: 800;
    color: ${theme.colors.ink};
  }

  span {
    font-size: 12px;
    color: ${theme.colors.muted};
  }
`

export const Empty = styled.p`
  margin: 0;
  color: ${theme.colors.muted};
  font-size: 14px;
`
