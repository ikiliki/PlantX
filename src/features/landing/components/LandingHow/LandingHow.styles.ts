import styled from 'styled-components'
import { theme } from '../../../../theme/tokens'

export const Band = styled.section`
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: 56px ${theme.space.md};

  @media (min-width: ${theme.breakpoints.md}) {
    padding: 76px 28px;
  }
`

export const Head = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 28px;

  @media (min-width: ${theme.breakpoints.md}) {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
`

export const Kicker = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${theme.colors.moss};
`

export const Title = styled.h2`
  margin: 12px 0 0;
  font-family: ${theme.fonts.display};
  font-weight: 400;
  font-size: clamp(32px, 4vw, 44px);
  color: ${theme.colors.forest};
`

export const Lead = styled.p`
  margin: 0;
  max-width: 42ch;
  color: ${theme.colors.muted};
  line-height: 1.6;
`

export const Steps = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: ${theme.breakpoints.md}) {
    grid-template-columns: repeat(4, 1fr);
  }
`

export const Step = styled.article`
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  border-radius: 22px;
  padding: 14px;
  box-shadow: ${theme.shadow.soft};

  h3 {
    margin: 0;
    font-family: ${theme.fonts.display};
    font-weight: 400;
    font-size: 24px;
    color: ${theme.colors.forest};
  }

  p {
    margin: 8px 0 0;
    color: ${theme.colors.muted};
    font-size: 13px;
    line-height: 1.55;
  }
`

export const Photo = styled.div`
  height: 160px;
  border-radius: 16px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const Index = styled.div`
  width: 34px;
  height: 34px;
  margin: 14px 0 10px;
  border-radius: 50%;
  background: ${theme.colors.growth};
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 800;
  color: ${theme.colors.forest};
`
