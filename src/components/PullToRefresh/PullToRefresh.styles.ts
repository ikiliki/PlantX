import styled, { keyframes } from 'styled-components'
import { theme } from '../../theme/tokens'

const spin = keyframes`
  to { transform: rotate(360deg); }
`

/** Opens above the feed as you pull; springs shut when you let go. */
export const Indicator = styled.div<{ $settling: boolean }>`
  display: grid;
  place-items: center;
  overflow: hidden;
  min-width: 0;
  transition: ${({ $settling }) => ($settling ? `height ${theme.motion.base} ${theme.motion.ease}` : 'none')};
`

export const Arrow = styled.span<{ $ready: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
  transform: rotate(${({ $ready }) => ($ready ? '180deg' : '0deg')});
  transition: transform ${theme.motion.base} ${theme.motion.ease};

  /* A down arrow; it turns up once a release would refresh. */
  &::before {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    margin: 9px auto 0;
    border-inline-end: 2px solid ${theme.colors.forest};
    border-block-end: 2px solid ${theme.colors.forest};
    transform: rotate(45deg);
  }
`

export const Spinner = styled.span`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 3px solid ${theme.colors.chipGreen};
  border-top-color: ${theme.colors.forest};
  animation: ${spin} 0.8s linear infinite;
`
