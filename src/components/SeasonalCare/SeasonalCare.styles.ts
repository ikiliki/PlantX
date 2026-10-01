import styled from 'styled-components'
import { pressable, riseIn } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const Root = styled.section`
  container-type: inline-size;
  display: grid;
  gap: ${theme.space.md};
  min-width: 0;
  padding: 20px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
`

export const Title = styled.h3`
  margin: 0;
  text-align: center;
  font-family: ${theme.fonts.display};
  font-size: 22px;
  letter-spacing: 0.04em;
  color: ${theme.colors.forest};
`

export const Tabs = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${theme.space.sm};
  @container (max-width: 380px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

export const SeasonTab = styled.button<{ $on: boolean }>`
  ${pressable}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  height: 36px;
  padding: 0 10px;
  border: 1px solid ${({ $on }) => ($on ? theme.colors.warmth : theme.colors.border)};
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.warmth : 'transparent')};
  box-shadow: ${({ $on }) => ($on ? `0 0 0 2px ${theme.colors.creamCard}, 0 0 0 3px ${theme.colors.warmth}` : 'none')};
  color: ${({ $on }) => ($on ? theme.colors.ink : theme.colors.muted)};
  font-size: 14px;
  font-weight: ${({ $on }) => ($on ? 700 : 500)};
  white-space: nowrap;
  cursor: pointer;
  &:hover {
    border-color: ${({ $on }) => ($on ? theme.colors.warmth : theme.colors.moss)};
    color: ${theme.colors.ink};
  }
`

export const Divider = styled.hr`
  margin: 0;
  border: 0;
  border-top: 1px solid ${theme.colors.border};
`

export const Rows = styled.div`
  display: grid;
  gap: 14px;
  > * {
    animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} backwards;
  }
  > :nth-child(2) {
    animation-delay: 50ms;
  }
  > :nth-child(3) {
    animation-delay: 100ms;
  }
`

export const Row = styled.div`
  display: grid;
  gap: ${theme.space.xs};
`

export const Label = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${theme.space.sm};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Drops = styled.span`
  display: inline-flex;
  gap: 2px;
  color: ${theme.colors.info};
`

export const Text = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${theme.colors.ink};
`

export const Footer = styled.div`
  display: grid;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px dashed ${theme.colors.border};
  font-size: 13px;
  line-height: 1.45;
  color: ${theme.colors.muted};
  strong {
    color: ${theme.colors.ink};
    font-weight: 600;
  }
`
