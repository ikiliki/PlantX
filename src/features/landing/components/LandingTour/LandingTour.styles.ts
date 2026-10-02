import styled from 'styled-components'
import { popIn, pressable, riseIn } from '../../../../theme/motion'
import { theme } from '../../../../theme/tokens'

export const Band = styled.section`
  width: min(1240px, 100%);
  margin: 0 auto;
  padding: 56px ${theme.space.md};
  scroll-margin-top: 72px;

  @container landing (min-width: 900px) {
    padding: 88px 28px;
  }
`

export const Head = styled.div`
  display: grid;
  gap: 12px;
  max-width: 62ch;
  margin-bottom: 28px;
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
  margin: 0;
  font-family: ${theme.fonts.display};
  font-weight: 400;
  font-size: clamp(32px, 5cqi, 48px);
  line-height: 1.05;
  color: ${theme.colors.forest};
`

export const Lead = styled.p`
  margin: 0;
  color: ${theme.colors.muted};
  font-size: 17px;
  line-height: 1.6;
`

export const View = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
  min-width: 0;
`

/** One row that scrolls sideways on a phone, like the app's chip rows. */
export const Tabs = styled.div`
  display: flex;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  scroll-snap-type: x proximity;

  &::-webkit-scrollbar {
    display: none;
  }
`

export const Tab = styled.button<{ $on: boolean }>`
  ${pressable}
  flex: none;
  scroll-snap-align: start;
  min-height: 42px;
  padding: 0 18px;
  border-radius: ${theme.radii.pill};
  border: 1px solid ${({ $on }) => ($on ? theme.colors.forest : theme.colors.border)};
  background: ${({ $on }) => ($on ? theme.colors.forest : theme.colors.creamCard)};
  color: ${({ $on }) => ($on ? theme.colors.cream : theme.colors.forest)};
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${theme.colors.growth};
    outline-offset: 2px;
  }
`

export const DeviceSwitch = styled.div`
  display: inline-flex;
  padding: 3px;
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chipNeutral};
  border: 1px solid ${theme.colors.border};
`

export const Device = styled.button<{ $on: boolean }>`
  min-height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: ${theme.radii.pill};
  background: ${({ $on }) => ($on ? theme.colors.creamCard : 'transparent')};
  box-shadow: ${({ $on }) => ($on ? theme.shadow.soft : 'none')};
  color: ${theme.colors.forest};
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`

export const Screen = styled.div<{ $device: 'desk' | 'phone' }>`
  display: grid;
  gap: 24px;
  align-items: center;
  min-width: 0;
  padding: 20px;
  border-radius: 30px;
  background: linear-gradient(160deg, ${theme.colors.chipGreen}, ${theme.colors.cream} 70%);
  border: 1px solid ${theme.colors.border};

  > div:first-child {
    display: grid;
    justify-items: center;
    min-width: 0;
    animation: ${popIn} 360ms ${theme.motion.ease} both;
  }

  @container landing (min-width: 900px) {
    grid-template-columns: ${({ $device }) =>
      $device === 'phone' ? 'minmax(0, 1fr) minmax(0, 1fr)' : 'minmax(0, 1.75fr) minmax(0, 1fr)'};
    gap: 40px;
    padding: 32px;
  }
`

export const Copy = styled.div`
  display: grid;
  gap: 12px;
  min-width: 0;
  animation: ${riseIn} 360ms ${theme.motion.ease} both;

  h3 {
    margin: 0;
    font-family: ${theme.fonts.display};
    font-weight: 400;
    font-size: clamp(26px, 3cqi, 34px);
    line-height: 1.1;
    color: ${theme.colors.forest};
  }

  p {
    margin: 0;
    color: ${theme.colors.muted};
    font-size: 16px;
    line-height: 1.6;
  }
`

export const Points = styled.ul`
  display: grid;
  gap: 10px;
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
`

export const Point = styled.li`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  color: ${theme.colors.ink};
  font-size: 15px;
  line-height: 1.5;

  i {
    flex: none;
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: ${theme.colors.growth};
    color: ${theme.colors.forest};
    font-style: normal;
    font-size: 12px;
    font-weight: 800;
  }
`
