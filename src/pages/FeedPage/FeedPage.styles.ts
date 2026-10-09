import styled from 'styled-components'
import { theme } from '../../theme/tokens'

/** One readable column of posts, centred, at every width. */
export const Page = styled.div`
  display: grid;
  gap: ${theme.space.md};
  width: min(100%, 620px);
  min-width: 0;
  margin-inline: auto;
`

/** Same row as the greenhouse filters (`CollectionBoard` Toolbar); Refresh sits at the end when wide. */
export const Tools = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px 12px;
  min-width: 0;

  > :last-child:not(:first-child) {
    margin-inline-start: auto;
  }
`

export const Empty = styled.p`
  margin: 0;
  padding: 28px 20px;
  text-align: center;
  color: ${theme.colors.muted};
  background: ${theme.colors.creamCard};
  border-radius: ${theme.radii.lg};
`
