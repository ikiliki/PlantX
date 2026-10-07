import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Page = styled.div`
  container-type: inline-size;
  display: grid;
  gap: 0;
  width: 100%;
  min-width: 0;
  min-height: min(720px, calc(100svh - ${theme.layout.chromeTop} - 48px));
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
`
