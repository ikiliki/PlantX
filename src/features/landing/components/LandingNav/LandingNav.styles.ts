import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Bar = styled.header<{ $solid: boolean }>`
  position: sticky;
  top: 0;
  z-index: ${theme.z.topBar};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.space.md};
  height: 68px;
  padding: 0 ${theme.space.md};
  color: ${theme.colors.forest};
  background: ${({ $solid }) => ($solid ? 'color-mix(in srgb, var(--c-creamCard) 90%, transparent)' : 'transparent')};
  backdrop-filter: ${({ $solid }) => ($solid ? 'blur(14px) saturate(1.2)' : 'none')};
  border-bottom: 1px solid ${({ $solid }) => ($solid ? theme.colors.border : 'transparent')};
  box-shadow: ${({ $solid }) => ($solid ? theme.shadow.soft : 'none')};
  transition:
    background ${theme.motion.base} ${theme.motion.ease},
    color ${theme.motion.base} ${theme.motion.ease},
    border-color ${theme.motion.base} ${theme.motion.ease},
    box-shadow ${theme.motion.base} ${theme.motion.ease};

  @media (min-width: ${theme.breakpoints.md}) {
    height: ${theme.layout.topBar};
    padding: 0 56px;
  }
`

export const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  font-family: ${theme.fonts.display};
  font-size: 24px;
  color: inherit;
`

export const BrandMark = styled.img<{ $solid: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  box-shadow: ${({ $solid }) => ($solid ? 'none' : '0 0 0 2px color-mix(in srgb, var(--c-growth) 45%, transparent)')};
  transition: transform ${theme.motion.slow} ${theme.motion.spring};

  a:hover > & {
    transform: rotate(-12deg) scale(1.06);
  }
`

export const Links = styled.nav`
  display: none;
  align-items: center;
  gap: 22px;

  @media (min-width: ${theme.breakpoints.md}) {
    display: flex;
  }
`

export const Jump = styled.a`
  font-size: 14px;
  font-weight: 500;
  color: inherit;
  opacity: 0.82;

  &:hover {
    opacity: 1;
  }
`

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`

export const Lang = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: ${theme.radii.pill};
  border: 1px solid currentColor;
  opacity: 0.9;

  /* Mock-only toggle; on the narrowest phones Settings still switches language. */
  @media (max-width: 359px) {
    display: none;
  }
`

export const LangBtn = styled.button<{ $on: boolean; $solid: boolean }>`
  appearance: none;
  cursor: pointer;
  border: 0;
  border-radius: ${theme.radii.pill};
  padding: 6px 10px;
  min-height: 32px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: ${({ $on, $solid }) =>
    $on ? ($solid ? theme.colors.forest : theme.colors.growth) : 'transparent'};
  color: ${({ $on, $solid }) =>
    $on ? ($solid ? theme.colors.creamCard : theme.colors.forest) : 'inherit'};
`

export const Enter = styled(Link)`
  ${pressable}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 8px 18px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.cream};
  font-size: 13px;
  font-weight: 700;
`
