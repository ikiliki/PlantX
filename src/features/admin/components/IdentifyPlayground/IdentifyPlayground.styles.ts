import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Stages = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
`

export const Stage = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  min-width: 0;
  padding-bottom: 12px;
  border-bottom: 1px solid ${theme.colors.border};

  &:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }

  strong {
    font-size: 13px;
    color: ${theme.colors.forest};
  }
`

export const Form = styled.form`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${theme.space.md};
  min-width: 0;
`

export const Hint = styled.p<{ $warn?: boolean }>`
  margin: 0;
  font-size: 12px;
  font-weight: ${({ $warn }) => ($warn ? 700 : 400)};
  letter-spacing: 0;
  text-transform: none;
  color: ${({ $warn }) => ($warn ? theme.colors.warn : theme.colors.muted)};
`

export const PhotoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
`

export const Preview = styled.div`
  width: 72px;
  height: 72px;
  flex: none;
  border-radius: 10px;
  overflow: hidden;
  background: ${theme.colors.chipGreen};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`

export const Output = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  min-width: 0;
  padding: 14px 16px;
  border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.cream};
`

export const Empty = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${theme.colors.muted};
`
