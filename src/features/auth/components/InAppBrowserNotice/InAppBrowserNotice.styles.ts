import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

const onForest = (alpha: number) => `color-mix(in srgb, var(--c-cream) calc(${alpha} * 100%), transparent)`

export const Card = styled.div`
  display: grid;
  gap: 10px;
  padding: 14px 16px;
  border-radius: ${theme.radii.lg};
  background: ${onForest(0.12)};
  box-shadow: inset 0 0 0 1px ${onForest(0.18)};
  color: ${theme.colors.cream};
  text-align: start;

  strong {
    font-size: 15px;
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
  }
`

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const Action = styled.a`
  ${pressable}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 16px;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${onForest(0.92)};
  color: ${theme.colors.forest};
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
`

export const Quiet = styled(Action).attrs({ as: 'button' })`
  background: transparent;
  color: ${theme.colors.cream};
  box-shadow: inset 0 0 0 1px ${onForest(0.4)};
`
