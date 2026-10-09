import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Back = styled(Link)`
  ${pressable}
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-self: start;
  min-height: 40px;
  padding: 0 16px 0 10px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
  color: ${theme.colors.forest};
  font-family: ${theme.fonts.display};
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;

  svg {
    width: 18px;
    height: 18px;
  }

  [dir='rtl'] & svg {
    transform: scaleX(-1);
  }

  &:hover {
    background: ${theme.colors.chipGreen};
  }
`
