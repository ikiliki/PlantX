import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { pressable, riseIn } from '../../theme/motion'
import { theme } from '../../theme/tokens'

export const Shell = styled.div`
  min-height: 100%;
  display: grid;
  grid-template-rows: auto auto 1fr;
  background: ${theme.surface.page};
`

export const Main = styled.main<{ $wide?: boolean }>`
  padding: ${theme.space.md};
  padding-bottom: calc(${theme.layout.bottomNav} + ${theme.space.xl});
  max-width: ${({ $wide }) => ($wide ? theme.layout.homeMax : theme.layout.max)};
  width: 100%;
  min-width: 0;
  margin: 0 auto;
  @media (min-width: ${theme.breakpoints.md}) {
    padding: 56px ${theme.space.xl} 72px;
  }
`

export const BottomNav = styled.nav<{ $cols?: number }>`
  position: fixed;
  bottom: 0;
  inset-inline: 0;
  z-index: ${theme.z.bottomNav};
  display: grid;
  grid-template-columns: repeat(${({ $cols = 5 }) => Math.max($cols, 1)}, minmax(0, 1fr));
  background: ${theme.surface.nav};
  backdrop-filter: blur(12px);
  border-top: 1px solid ${theme.surface.barBorder};
  padding: 6px ${theme.space.xs} calc(6px + env(safe-area-inset-bottom));
  @media (min-width: ${theme.breakpoints.md}) {
    display: none;
  }
`

export const BottomLink = styled(Link)<{ $active?: boolean }>`
  ${pressable}
  position: relative;
  display: grid;
  justify-items: center;
  gap: 2px;
  font-size: 11px;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  color: ${({ $active }) => ($active ? theme.surface.barInk : theme.surface.barMuted)};
  padding: 6px 2px;
  border-radius: ${theme.radii.md};
`

export const BottomIcon = styled.span<{ $active?: boolean }>`
  display: grid;
  place-items: center;
  width: 52px;
  height: 30px;
  border-radius: ${theme.radii.pill};
  background: ${({ $active }) => ($active ? theme.surface.barActive : 'transparent')};
  transform: scale(${({ $active }) => ($active ? 1 : 0.92)});
  transition:
    background ${theme.motion.base} ${theme.motion.ease},
    transform ${theme.motion.base} ${theme.motion.spring};
`

export const PageHeader = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${theme.space.md};
  margin-bottom: ${theme.space.xl};
  animation: ${riseIn} ${theme.motion.slow} ${theme.motion.ease} both;
  h1 {
    font-size: ${theme.text.display};
    color: ${theme.colors.ink};
  }
  p {
    color: ${theme.colors.muted};
    font-size: 14px;
    margin-top: 6px;
  }
`

export const Grid = styled.div<{ $min?: string }>`
  display: grid;
  gap: ${theme.space.md};
  grid-template-columns: repeat(auto-fill, minmax(${({ $min = '240px' }) => $min}, 1fr));
`

export const SectionTitle = styled.h2`
  font-size: 26px;
  margin: ${theme.space.xl} 0 ${theme.space.md};
  color: ${theme.colors.ink};
`
