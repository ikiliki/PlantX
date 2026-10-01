import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Root = styled.aside`
  display: grid;
  min-width: 0;
  width: min(300px, 100%);
  border-radius: ${theme.radii.lg};
  border: 1px solid ${theme.colors.border};
  background:
    linear-gradient(180deg, rgba(255, 254, 250, 0.98), rgba(228, 235, 216, 0.35)),
    ${theme.colors.creamCard};
  box-shadow: ${theme.shadow.soft};
  overflow: hidden;

  @container (min-width: 961px) {
    position: sticky;
    top: ${theme.space.md};
    align-self: start;
    height: min(72svh, 640px);
  }

  @container (max-width: 960px) {
    width: 100%;
    height: min(42svh, 360px);
  }
`

export const Scroll = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  padding: 14px 12px;
  scroll-behavior: smooth;
`

export const Message = styled.div`
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  padding: 10px 12px;
  border-radius: ${theme.radii.md};
  background: rgba(255, 254, 250, 0.88);
  border: 1px solid ${theme.colors.border};
  color: inherit;
  text-decoration: none;
`

export const Photo = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${theme.radii.pill};
  overflow: hidden;
  background: ${theme.colors.chipGreen};
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const Meta = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
`

export const Event = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: ${theme.colors.ink};

  strong {
    font-weight: 700;
  }
`

export const When = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Empty = styled.p`
  margin: auto 0;
  padding: 24px 8px;
  text-align: center;
  font-size: 14px;
  color: ${theme.colors.muted};
`
