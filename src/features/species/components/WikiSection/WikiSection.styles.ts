import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Section = styled.section`
  display: grid;
  gap: 12px;
  min-width: 0;
  scroll-margin-top: 72px;
  h2 {
    margin: 0;
    font-size: inherit;
    font-weight: inherit;
  }
`

export const Toggle = styled.button`
  appearance: none;
  display: inline-flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  margin: 0;
  padding: 0 0 6px;
  border: 0;
  border-bottom: 1px solid ${theme.colors.border};
  background: transparent;
  font: inherit;
  text-align: start;
  cursor: pointer;
  color: ${theme.colors.ink};
`

export const Title = styled.span`
  font-family: ${theme.fonts.display};
  font-size: clamp(22px, 2.4vw, 28px);
  line-height: 1.2;
`

export const Hint = styled.span`
  flex-shrink: 0;
  font-family: ${theme.fonts.body};
  font-size: 13px;
  font-weight: 500;
  color: ${theme.colors.muted};
`

export const Body = styled.div`
  display: grid;
  gap: 12px;
  min-width: 0;
  font-size: 15px;
  line-height: 1.65;
  color: ${theme.colors.ink};
  &[hidden] {
    display: none;
  }
`
