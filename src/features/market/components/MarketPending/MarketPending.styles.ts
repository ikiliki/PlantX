import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { pressable } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Root = styled.div`
  container-type: inline-size;
  width: 100%;
  min-width: 0;
`

export const Head = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${theme.space.md};
  margin-bottom: ${theme.space.lg};

  h1 {
    margin: 0;
    font-family: ${theme.fonts.display};
    font-weight: 400;
    font-size: clamp(30px, 4vw, 42px);
    color: ${theme.colors.ink};
  }
`

export const Copy = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
`

export const Sub = styled.p`
  margin: 0;
  max-width: 46ch;
  color: ${theme.colors.muted};
  font-size: 14px;
  line-height: 1.45;
`

export const ChartsLink = styled(Link)`
  ${pressable}
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.creamCard};
  color: ${theme.colors.forest};
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: ${theme.shadow.soft};

  &:hover {
    border-color: ${theme.colors.forest};
    background: ${theme.colors.chipGreen};
  }
`

export const Veil = styled.div`
  position: relative;
  min-width: 0;
  overflow: hidden;
`

export const DataBlur = styled.div`
  filter: blur(5px);
  pointer-events: none;
  user-select: none;
`

export const FilterBlur = styled.div`
  margin-bottom: 18px;
  filter: blur(2px);
  pointer-events: none;
  user-select: none;
`

export const SoonBanner = styled.div`
  position: absolute;
  inset: 0;
  z-index: 3;
  overflow: hidden;
  pointer-events: none;

  span {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 160%;
    margin: 0;
    padding: 8px 0;
    transform: translate(-50%, -50%) rotate(-12deg);
    background: rgba(255, 254, 250, 0.94);
    border-block: 1px solid ${theme.colors.border};
    box-shadow: ${theme.shadow.soft};
    color: ${theme.colors.forest};
    font-family: ${theme.fonts.display};
    font-size: clamp(20px, 3vw, 28px);
    font-weight: 400;
    line-height: 1.1;
    text-align: center;
    white-space: nowrap;
  }
`

export const Split = styled.div`
  display: grid;
  gap: 16px;
  min-width: 0;

  @container (max-width: 959px) {
    > :last-child {
      order: -1;
    }
  }

  @container (min-width: 960px) {
    grid-template-columns: minmax(0, 1fr) minmax(260px, 34%);
    align-items: start;
  }
`

export const MapSlot = styled.div`
  height: 420px;
  min-width: 0;

  @container (min-width: 960px) {
    position: sticky;
    top: 12px;
    height: 560px;
  }
`

export const Widget = styled.section`
  position: relative;
  display: grid;
  gap: 10px;
  min-width: 0;
  padding: 14px 14px 16px;
  background: ${theme.colors.creamCard};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadow.soft};
`
