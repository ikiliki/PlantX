import styled from 'styled-components'
import { riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

/** An actions list: one card, rows split by hairlines. */
export const Actions = styled.div`
  display: grid;
  overflow: hidden;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.card};
  container-type: inline-size;
  animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} both;
`

/** Icon, what it is and does, then its control. On a narrow card the control drops under the words. */
export const Action = styled.div<{ $danger?: boolean }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas:
    'icon copy'
    'icon control';
  align-items: center;
  gap: 10px 14px;
  padding: 16px;
  background: ${({ $danger }) => ($danger ? 'color-mix(in srgb, var(--c-danger) 4%, transparent)' : 'transparent')};

  & + & {
    border-top: 1px solid ${theme.colors.border};
  }

  @container (min-width: 460px) {
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas: 'icon copy control';
  }
`

export const ActionIcon = styled.span<{ $danger?: boolean }>`
  grid-area: icon;
  align-self: start;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: ${theme.radii.md};
  background: ${({ $danger }) => ($danger ? theme.colors.chipDanger : theme.colors.chipGreen)};
  color: ${({ $danger }) => ($danger ? theme.colors.danger : theme.colors.forest)};
`

export const ActionCopy = styled.span`
  grid-area: copy;
  display: grid;
  gap: 2px;
  min-width: 0;
`

export const ActionTitle = styled.span<{ $danger?: boolean }>`
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: ${theme.text.md};
  color: ${({ $danger }) => ($danger ? theme.colors.danger : theme.colors.forest)};
`

export const ActionHint = styled.span`
  font-size: ${theme.text.sm};
  line-height: 1.45;
  color: ${theme.colors.muted};
`

export const ActionControl = styled.span`
  grid-area: control;
  display: flex;
  justify-content: flex-start;
  min-width: 0;

  @container (min-width: 460px) {
    justify-content: flex-end;
  }
`
