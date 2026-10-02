import styled, { css } from 'styled-components'
import { theme } from '../../../../theme/tokens'

const shell = css`
  min-width: 0;
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.lift};
  overflow: hidden;
`

export const Browser = styled.figure`
  ${shell}
  margin: 0;
  width: 100%;
  border: 1px solid ${theme.colors.border};
  border-radius: 18px;
`

export const Bar = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  height: 26px;
  padding-inline: 12px;
  background: ${theme.colors.chipNeutral};
  border-bottom: 1px solid ${theme.colors.border};
`

export const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${theme.colors.track};
`

export const Phone = styled.figure`
  ${shell}
  position: relative;
  margin: 0;
  width: min(260px, 100%);
  padding: 8px;
  border-radius: 36px;
  background: ${theme.colors.forest};
`

export const Screen = styled.div<{ $device: 'desk' | 'phone' }>`
  overflow: hidden;
  background: ${theme.colors.cream};
  aspect-ratio: ${({ $device }) => ($device === 'phone' ? '390 / 844' : '1440 / 900')};
  border-radius: ${({ $device }) => ($device === 'phone' ? '28px' : '0')};

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    user-select: none;
  }
`
