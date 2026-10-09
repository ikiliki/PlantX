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

export const Tools = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.space.sm};
  min-width: 0;

  > :first-child {
    flex: 1;
    min-width: 0;
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
