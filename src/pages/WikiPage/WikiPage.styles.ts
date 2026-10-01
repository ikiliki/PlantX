import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { theme } from '../../theme/tokens'

export const Page = styled.div`
  display: grid;
  gap: 20px;
  container-type: inline-size;
  width: 100%;
  min-width: 0;
`

export const Back = styled(Link)`
  width: fit-content;
  font-size: 13px;
  font-weight: 700;
  color: ${theme.colors.muted};
  &:hover {
    color: ${theme.colors.forest};
  }
`

export const Header = styled.header`
  display: grid;
  gap: 6px;
  h1 {
    margin: 0;
    font-size: clamp(28px, 6cqw, 40px);
    color: ${theme.colors.ink};
  }
  p {
    margin: 0;
    font-size: 15px;
    color: ${theme.colors.muted};
  }
`

export const Missing = styled.p`
  padding: ${theme.space.xxl} 0;
  color: ${theme.colors.muted};
  text-align: center;
`
