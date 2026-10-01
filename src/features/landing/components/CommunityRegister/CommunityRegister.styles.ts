import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Panel = styled.section`
  display: grid;
  gap: 14px;
  width: min(100%, 420px);
  padding: 20px;
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
`

export const Copy = styled.div`
  display: grid;
  gap: 6px;
`

export const Title = styled.h2`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: 400;
  font-size: 24px;
  line-height: 1.2;
  color: ${theme.colors.forest};
`

export const Body = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${theme.colors.muted};
`

export const Form = styled.form`
  display: grid;
  gap: 12px;
`

export const ErrorText = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.danger};
`

export const Submit = styled.button`
  ${pressable}
  appearance: none;
  cursor: pointer;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 22px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.growth};
  color: ${theme.colors.forest};
  font-size: 15px;
  font-weight: 700;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`

export const Success = styled.p`
  margin: 0;
  padding: 14px 16px;
  border-radius: ${theme.radii.md};
  background: ${theme.colors.chipGreen};
  color: ${theme.colors.forest};
  font-size: 14px;
  line-height: 1.5;
  font-weight: 600;
`
