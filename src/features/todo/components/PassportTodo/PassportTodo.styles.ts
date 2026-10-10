import styled from 'styled-components'
import type { TodoSubcategory } from '../../../../mock/types'
import { theme } from '../../../../theme/tokens'
import { careColor, careTint } from '../../careKinds'

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

/** A block heading with a quiet note at the end (where the plan comes from, how many on time). */
export const BlockHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 12px;
  min-width: 0;
`

export const HeadNote = styled.span`
  font-size: 12px;
  color: ${theme.colors.muted};
`

export const List = styled.ul`
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
`

/** One kind of care in the plan: icon, cadence, next due, and the owner's pencil. */
export const PlanRow = styled.li<{ $tone: TodoSubcategory; $off?: boolean; $mark?: boolean }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  gap: 10px;
  align-items: center;
  min-width: 0;
  padding: 10px 12px;
  border-radius: ${theme.radii.md};
  border: 1px solid
    ${({ $tone, $mark }) => ($mark ? careColor($tone) : `color-mix(in srgb, ${careColor($tone)} 30%, transparent)`)};
  background: ${({ $tone, $off }) => ($off ? 'transparent' : `linear-gradient(90deg, ${careTint($tone, 12)}, var(--c-creamCard) 80%)`)};
  box-shadow: ${({ $mark }) => ($mark ? theme.shadow.soft : 'none')};
  opacity: ${({ $off }) => ($off ? 0.7 : 1)};
`

/** The next-due chip on a plan row; a link to the task for its owner. */
export const Due = styled.span<{ $tone: TodoSubcategory; $late?: boolean }>`
  padding: 3px 9px;
  border-radius: ${theme.radii.pill};
  background: ${({ $tone, $late }) => ($late ? theme.colors.chipWarm : careTint($tone, 18))};
  color: ${({ $late }) => ($late ? theme.colors.warn : theme.colors.ink)};
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  text-decoration: none;

  &:is(a):hover {
    box-shadow: ${theme.shadow.soft};
  }
  &:is(a):focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 2px;
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
    overflow-wrap: anywhere;
  }
`

/** Twelve week cells, oldest first; a filled cell had care that week, in the colour of its first kind. */
export const Weeks = styled.ol`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 4px;
  max-width: 360px;
  margin: 0;
  padding: 0;
  list-style: none;
`

export const Week = styled.li<{ $tone?: TodoSubcategory }>`
  aspect-ratio: 1;
  border-radius: 4px;
  background: ${({ $tone }) => ($tone ? careColor($tone) : 'color-mix(in srgb, var(--c-forest) 8%, transparent)')};
`

/** A finished task in the history. */
export const DoneRow = styled.li<{ $tone: TodoSubcategory; $mark?: boolean }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  min-width: 0;
  padding: 8px 12px;
  border-radius: ${theme.radii.md};
  border: 1px solid ${({ $tone, $mark }) => ($mark ? careColor($tone) : theme.colors.border)};
  background: ${theme.colors.cream};
  box-shadow: ${({ $mark }) => ($mark ? theme.shadow.soft : 'none')};
`

export const Empty = styled.p`
  margin: 0;
  color: ${theme.colors.muted};
  font-size: 14px;
`
