import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.div`
  container-type: inline-size;
  display: grid;
  gap: ${theme.space.lg};
  width: 100%;
  min-width: 0;
`

export const Hello = styled.header`
  display: grid;
  gap: 2px;
`

export const Greeting = styled.h1`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: ${theme.text.xl};
  line-height: 1.15;
  color: ${theme.colors.ink};
  text-wrap: balance;
`

export const Summary = styled.p`
  margin: 0;
  font-size: ${theme.text.sm};
  color: ${theme.colors.muted};
`

export const Section = styled.section`
  display: grid;
  gap: ${theme.space.sm};
  min-width: 0;
`

export const Head = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${theme.space.md};
`

export const HeadTitle = styled.h2`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: ${theme.text.md};
  color: ${theme.colors.ink};
`

const arrow = `
  &::after {
    content: ' →';
  }
  [dir='rtl'] &::after {
    content: ' ←';
  }
`

export const HeadLink = styled(Link)`
  font-size: ${theme.text.sm};
  font-weight: 700;
  color: ${theme.colors.forest};
  white-space: nowrap;
  text-decoration: none;
  ${arrow}
`

export const More = styled(Link)`
  justify-self: end;
  font-size: ${theme.text.sm};
  font-weight: 700;
  color: ${theme.colors.forest};
  text-decoration: none;
  ${arrow}
`

/** One sideways row; the page itself never scrolls sideways. */
export const Strip = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min(38%, 150px);
  gap: ${theme.space.sm};
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding-block-end: 2px;

  &::-webkit-scrollbar {
    display: none;
  }
`

export const PlantCard = styled(Link)`
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: 6px;
  scroll-snap-align: start;
  background: ${theme.colors.creamCard};
  border-radius: ${theme.radii.md};
  box-shadow: ${theme.shadow.card};
  color: inherit;
  text-decoration: none;
`

export const PlantPhoto = styled.div`
  aspect-ratio: 1;
  max-width: 100%;
  overflow: hidden;
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.cream};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`

export const PlantName = styled.span`
  padding-inline: 2px;
  font-size: ${theme.text.sm};
  font-weight: 700;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const Calm = styled.p`
  margin: 0;
  padding: 14px 16px;
  font-size: ${theme.text.sm};
  color: ${theme.colors.muted};
  background: ${theme.colors.creamCard};
  border-radius: ${theme.radii.md};
  box-shadow: ${theme.shadow.card};
`

export const First = styled.div`
  display: grid;
  gap: ${theme.space.sm};
  justify-items: start;
  padding: 18px;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.deep};
  color: ${theme.colors.onDeep};
`

export const FirstTitle = styled.h2`
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: ${theme.fonts.displayWeight};
  font-size: ${theme.text.lg};
  color: inherit;
`

export const FirstBody = styled.p`
  margin: 0;
  font-size: ${theme.text.sm};
  opacity: 0.85;
`

export const FirstAction = styled.button`
  min-height: ${theme.control.sm};
  padding: 0 18px;
  border: 0;
  border-radius: ${theme.radii.control};
  background: ${theme.colors.growth};
  color: ${theme.colors.onGrowth};
  font: inherit;
  font-weight: 800;
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid ${theme.colors.growth};
    outline-offset: 2px;
  }
`

/** One column on a phone; wide, your own things on the start side and the community rows on the end. */
export const Columns = styled.div`
  display: grid;
  gap: ${theme.space.lg};
  min-width: 0;

  @container (min-width: 900px) {
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
    align-items: start;
    column-gap: ${theme.space.xl};
  }
`

export const Column = styled.div`
  display: grid;
  gap: ${theme.space.lg};
  min-width: 0;
`
