import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export type HealthTone = 'ok' | 'warn' | 'bad'

const TONE: Record<HealthTone, string> = {
  ok: theme.colors.moss,
  warn: theme.colors.warn,
  bad: theme.colors.danger,
}

export const Root = styled.section`
  container-type: inline-size;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  padding: 20px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
  min-width: 0;
`

export const Head = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;

  h2 {
    margin: 0;
    color: ${theme.colors.forest};
    font-size: 18px;
  }
`

export const Lead = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${theme.colors.muted};
`

export const Rows = styled.dl`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  margin: 0;
  min-width: 0;
`

export const Row = styled.div`
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr);
  gap: 4px 10px;
  align-items: baseline;
  padding: 10px 0;
  border-top: 1px solid ${theme.colors.border};
  min-width: 0;

  &:first-child {
    border-top: 0;
  }

  @container (min-width: 520px) {
    grid-template-columns: 14px minmax(140px, 0.4fr) minmax(0, 1fr);
  }

  dt {
    font-size: 13px;
    font-weight: 700;
    color: ${theme.colors.ink};
  }

  dd {
    grid-column: 2;
    margin: 0;
    font-size: 13px;
    line-height: 1.45;
    color: ${theme.colors.muted};
    overflow-wrap: anywhere;

    @container (min-width: 520px) {
      grid-column: 3;
    }
  }
`

export const Dot = styled.span<{ $tone: HealthTone }>`
  align-self: center;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $tone }) => TONE[$tone]};
`

export const Updated = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${theme.colors.muted};
`

export const Note = styled.p<{ $tone?: HealthTone }>`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${({ $tone }) => ($tone === 'bad' ? theme.colors.danger : theme.colors.muted)};
`
