import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'
import { scrollReveal, sectionTitle, srOnly } from '../../landingType'

export const Wrap = styled.section`
  width: min(1180px, 100%);
  margin: 0 auto 72px;
  padding: 0 ${theme.space.md};
  scroll-margin-top: 72px;
`

export const Box = styled.div`
  display: grid;
  gap: 28px;
  align-items: center;
  min-width: 0;
  ${scrollReveal}
  border-radius: ${theme.radii.lg};
  padding: 28px;
  background:
    radial-gradient(90% 120% at 0% 0%, color-mix(in srgb, var(--c-growth) 35%, transparent), transparent 60%),
    ${theme.colors.creamCard};
  border: 0;
  box-shadow: ${theme.shadow.lift};

  @container landing (min-width: 900px) {
    grid-template-columns: minmax(0, 1fr) min(400px, 100%);
    gap: 48px;
    padding: 48px;
  }
`

export const Kicker = styled.p`
  ${srOnly}
`

export const Title = styled.h2`
  ${sectionTitle}
`

export const Body = styled.p`
  margin: 16px 0 0;
  max-width: 44ch;
  color: ${theme.colors.muted};
  font-size: 17px;
  line-height: 1.6;
`

export const Card = styled.div`
  min-width: 0;
  width: 100%;
`

export const Open = styled(Link)`
  ${pressable}
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 54px;
  padding: 0 28px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.forest};
  color: ${theme.colors.cream};
  font-family: ${theme.fonts.display};
  font-size: 17px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.22), ${theme.shadow.soft};

  &:hover {
    background: ${theme.colors.forestMid};
    transform: translateY(-2px);
  }

  &:active {
    box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.22);
  }

  /* The arrow points on and out (up-right; up-left in RTL) and nudges further on hover. */
  svg {
    transform: rotate(45deg);
    transition: transform ${theme.motion.base} ${theme.motion.ease};
  }

  &:hover svg {
    transform: translate(2px, -2px) rotate(45deg);
  }

  [dir='rtl'] & svg {
    transform: rotate(-45deg);
  }

  [dir='rtl'] &:hover svg {
    transform: translate(-2px, -2px) rotate(-45deg);
  }
`
