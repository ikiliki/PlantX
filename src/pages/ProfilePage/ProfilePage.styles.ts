import styled, { css } from 'styled-components'
import { theme } from '../../theme/tokens'

const bleed = css`
  margin-inline: -${theme.space.md};
  @media (min-width: ${theme.breakpoints.md}) {
    margin-inline: -${theme.space.xl};
  }
`

export const Page = styled.div<{ $bleed?: boolean }>`
  container-type: inline-size;
  display: grid;
  gap: 20px;
  width: 100%;
  min-width: 0;
  ${({ $bleed }) =>
    $bleed &&
    css`
      margin-top: -${theme.space.md};
      @media (min-width: ${theme.breakpoints.md}) {
        margin-top: -56px;
      }
    `}
`

export const Banner = styled.header<{ $bleed?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 20px;
  padding: 24px 20px;
  background:
    radial-gradient(90% 120% at 100% 0%, rgba(207, 234, 120, 0.22), transparent 55%),
    ${theme.colors.forest};
  color: ${theme.colors.creamCard};
  ${({ $bleed }) => $bleed && bleed}

  @container (min-width: 720px) {
    padding: 28px 32px;
    gap: 18px 24px;
  }
`

export const AvatarRing = styled.span`
  display: grid;
  padding: 3px;
  border-radius: 50%;
  background: rgba(255, 254, 250, 0.28);
`

export const Identity = styled.div`
  display: grid;
  gap: 4px;
  flex: 1 1 220px;
  min-width: 0;
`

export const NameRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  h1 {
    margin: 0;
    font-family: ${theme.fonts.display};
    font-weight: 400;
    font-size: clamp(28px, 6cqw, 40px);
    line-height: 1.1;
    color: ${theme.colors.creamCard};
    overflow-wrap: anywhere;
  }
`

export const Meta = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  color: rgba(255, 254, 250, 0.78);
`

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-inline-start: auto;
`

export const Stats = styled.dl<{ $bleed?: boolean }>`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  box-shadow: ${theme.shadow.soft};
  ${({ $bleed }) =>
    $bleed &&
    css`
      ${bleed}
      border-radius: 0;
      border-inline: 0;
    `}

  @container (min-width: 760px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @container (max-width: 759px) {
    > :last-child:nth-child(odd) {
      grid-column: 1 / -1;
    }
  }
`

export const Stat = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
  padding: 16px 18px;
  border-inline-end: 1px solid ${theme.colors.border};
  border-bottom: 1px solid ${theme.colors.border};

  dt {
    font-size: 12px;
    color: ${theme.colors.muted};
  }
  dd {
    margin: 0;
    font-size: clamp(22px, 4cqw, 28px);
    font-weight: 500;
    color: ${theme.colors.forest};
    font-variant-numeric: tabular-nums;
  }
`

export const Columns = styled.div<{ $rails?: boolean }>`
  display: grid;
  gap: 16px;
  align-items: start;
  min-width: 0;

  @container (min-width: 860px) {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.9fr);
  }

  ${({ $rails }) =>
    $rails &&
    css`
      @container (min-width: 1120px) {
        grid-template-columns: minmax(0, 1.2fr) minmax(240px, 0.85fr);
      }
    `}
`

export const Stack = styled.div`
  display: grid;
  gap: 16px;
  min-width: 0;
`

export const Card = styled.section`
  display: grid;
  gap: 14px;
  align-content: start;
  min-width: 0;
  padding: 18px 20px;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadow.soft};
`

export const Body = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${theme.colors.ink};
`

export const Label = styled.span`
  font-size: 13px;
  color: ${theme.colors.muted};
`

export const Chips = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  li {
    padding: 6px 12px;
    border-radius: ${theme.radii.pill};
    background: ${theme.colors.chipGreen};
    color: ${theme.colors.forest};
    font-size: 13px;
  }
`

export const Place = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${theme.colors.muted};
`

export const Quote = styled.blockquote`
  margin: 0;
  padding: 14px 16px;
  border-radius: 16px;
  background: ${theme.colors.chipNeutral};
  color: ${theme.colors.ink};
  font-size: 14px;
  line-height: 1.45;
`

export const Stars = styled.span`
  color: #c4a15a;
  letter-spacing: 1px;
`

export const Bullets = styled.ul`
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 14px;
  color: ${theme.colors.ink};
  li {
    display: flex;
    gap: 8px;
    min-width: 0;
  }
  li::before {
    content: '•';
    color: ${theme.colors.moss};
  }
`

export const Rows = styled.div`
  display: grid;
  min-width: 0;
`

export const ActivityButton = styled.button`
  display: grid;
  grid-template-columns: minmax(72px, 92px) minmax(0, 1fr);
  gap: 2px 12px;
  width: 100%;
  padding: 12px 0;
  border: 0;
  border-top: 1px solid ${theme.colors.border};
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
  border-radius: ${theme.radii.sm};
  transition: background ${theme.motion.fast} ${theme.motion.ease};

  &:first-child {
    border-top: 0;
    padding-top: 2px;
  }

  time {
    grid-row: 1 / span 2;
    align-self: center;
    font-size: 12px;
    color: ${theme.colors.muted};
  }

  strong {
    font-size: 15px;
    font-weight: 700;
    color: ${theme.colors.forest};
    overflow-wrap: anywhere;
  }

  span {
    font-size: 13px;
    color: ${theme.colors.muted};
    overflow-wrap: anywhere;
  }

  &:hover {
    background: ${theme.colors.chipNeutral};
  }

  &:hover strong {
    text-decoration: underline;
  }
`

export const Empty = styled.p`
  margin: 0;
  color: ${theme.colors.muted};
  font-size: 14px;
`
