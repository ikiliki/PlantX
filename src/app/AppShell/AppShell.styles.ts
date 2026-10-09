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
    padding: 48px ${theme.space.xl} 72px;
  }
`

export const BottomNav = styled.nav<{ $cols?: number; $away?: boolean }>`
  /* Phone: a floating dock, not a bar glued to the edge. */
  position: fixed;
  bottom: calc(12px + env(safe-area-inset-bottom));
  inset-inline: 12px;
  z-index: ${theme.z.bottomNav};
  display: grid;
  grid-template-columns: repeat(${({ $cols = 5 }) => Math.max($cols, 1)}, minmax(0, 1fr));
  background: ${theme.surface.dock};
  border-radius: 28px;
  border: 1px solid ${theme.surface.dockEdge};
  box-shadow: ${theme.shadow.lift};
  padding: 6px;
  /* Tucks below the edge while the reader scrolls down; back on any scroll up. */
  transform: translateY(${({ $away }) => ($away ? 'calc(100% + 28px)' : '0')});
  transition: transform ${theme.motion.slow} ${theme.motion.ease};
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
  color: ${({ $active }) => ($active ? theme.surface.dockInk : theme.surface.dockMuted)};
  font-weight: 700;
  padding: 6px 2px;
  border-radius: ${theme.radii.md};
`

export const BottomIcon = styled.span<{ $active?: boolean }>`
  display: grid;
  place-items: center;
  width: 52px;
  height: 30px;
  border-radius: ${theme.radii.pill};
  background: ${({ $active }) => ($active ? theme.surface.dockActive : 'transparent')};
  color: ${({ $active }) => ($active ? theme.colors.onGrowth : 'inherit')};
  transform: scale(${({ $active }) => ($active ? 1.06 : 0.92)}) translateY(${({ $active }) => ($active ? '-2px' : '0')});
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
