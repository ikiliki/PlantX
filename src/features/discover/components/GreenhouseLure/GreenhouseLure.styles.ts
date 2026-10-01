import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Card = styled.div`
  display: block;
  min-width: 0;
  padding: 18px;
  container-type: inline-size;
  border-radius: ${theme.radii.lg};
  background:
    linear-gradient(165deg, rgba(207, 234, 120, 0.45), rgba(255, 254, 250, 0) 55%),
    ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadow.soft};
  color: ${theme.colors.ink};
  text-decoration: none;

  &:hover {
    box-shadow: ${theme.shadow.card};
  }
`

export const Body = styled.div`
  display: grid;
  gap: 14px;
  align-items: end;
  min-width: 0;

  @container (min-width: 420px) {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 16px;
  }
`

export const Copy = styled(Link)`
  display: grid;
  gap: 6px;
  min-width: 0;
  color: inherit;
  text-decoration: none;
`

export const Eyebrow = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  line-height: 1.15;
  overflow-wrap: break-word;
  color: ${theme.colors.forest};

  @container (min-width: 420px) {
    font-size: clamp(26px, 8cqi, 32px);
  }
`

export const Lure = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: ${theme.colors.muted};
`

export const Open = styled.span`
  margin-top: 2px;
  font-size: 13px;
  font-weight: 700;
  color: ${theme.colors.forest};

  &::after {
    content: '→';
    display: inline-block;
    margin-inline-start: 6px;
  }

  [dir='rtl'] &::after {
    content: '←';
  }
`

export const Photos = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`

const tile = css<{ $i: number }>`
  width: 76px;
  height: 98px;
  margin-inline-start: ${({ $i }) => ($i === 0 ? 0 : '-22px')};
  border-radius: 16px;
  border: 3px solid ${theme.colors.creamCard};
  background: ${theme.colors.chipNeutral};
  transform: rotate(${({ $i }) => ($i - 1) * 4}deg);
  box-shadow: ${theme.shadow.soft};
`

export const Photo = styled(Link)<{ $i: number }>`
  ${tile}
  display: block;
  overflow: hidden;
`

export const AddSlot = styled.button<{ $i: number }>`
  ${tile}
  display: grid;
  place-items: center;
  padding: 0;
  opacity: 0.45;
  color: ${theme.colors.forest};
  font-size: 28px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  transition: opacity ${theme.motion.fast} ${theme.motion.ease};

  &:hover {
    opacity: 0.72;
  }
`
