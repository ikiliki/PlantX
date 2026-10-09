import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { menuIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

/** Drops from the avatar, end-aligned; on a phone it nearly fills the width under the top bar. */
export const Panel = styled.div`
  position: fixed;
  z-index: ${theme.z.menu};
  top: calc(${theme.layout.topBar} + env(safe-area-inset-top, 0px));
  inset-inline-end: 12px;
  display: grid;
  gap: 2px;
  width: min(320px, calc(100vw - 24px));
  max-height: calc(100svh - ${theme.layout.topBar} - 24px);
  overflow-y: auto;
  padding: 10px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.dialog};
  transform-origin: top right;
  animation: ${menuIn} ${theme.motion.base} ${theme.motion.ease} both;

  [dir='rtl'] & {
    transform-origin: top left;
  }
`

export const Head = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px 8px;
`

export const Who = styled.div`
  display: grid;
  min-width: 0;
`

export const Name = styled.span`
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: ${theme.text.md};
  color: ${theme.colors.ink};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const Email = styled.span`
  font-size: ${theme.text.xs};
  color: ${theme.colors.muted};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const Rule = styled.hr`
  width: 100%;
  margin: 4px 0;
  border: 0;
  border-top: 1px solid ${theme.colors.border};
`

const row = css`
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 46px;
  margin: 0;
  padding: 4px 10px;
  border: 0;
  border-radius: ${theme.radii.md};
  background: none;
  color: ${theme.colors.ink};
  font: inherit;
  text-align: start;
  text-decoration: none;

  svg {
    color: ${theme.colors.forest};
  }
`

export const Row = styled.button`
  ${row}
  cursor: pointer;

  &:is(button, a):hover {
    background: ${theme.colors.chipNeutral};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: -2px;
  }
`

export const RowLink = styled(Link)`
  ${row}

  &:hover {
    background: ${theme.colors.chipNeutral};
  }
`

export const RowLabel = styled.span`
  font-size: ${theme.text.base};
  font-weight: 700;
`

export const Chevron = styled.span`
  font-size: ${theme.text.lg};
  line-height: 1;
  color: ${theme.colors.muted};

  [dir='rtl'] & {
    transform: scaleX(-1);
  }
`

/** The AI scans tile sits in the menu as its own row. */
export const Scans = styled.div`
  padding: 4px 6px;
`

export const Legal = styled.p`
  margin: 4px 0 0;
  padding: 0 10px 4px;
  font-size: ${theme.text.xs};
  color: ${theme.colors.muted};

  a {
    color: inherit;
  }
`
